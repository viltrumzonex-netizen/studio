import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { PoolConnection } from 'mysql2/promise';
import { getServerSession } from '@/lib/session';
import { VTC_SYMBOL } from '@/lib/constants';

// PATCH /api/recharges/[id] - Update a recharge request status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let connection: PoolConnection | null = null;
  try {
    const session = await getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ message: 'Acceso no autorizado.' }, { status: 403 });
    }

    const { id } = params;
    const { status } = await req.json();

    if (!id || !status || !['approved', 'denied'].includes(status)) {
      return NextResponse.json({ message: 'ID de solicitud y estado válido son requeridos.' }, { status: 400 });
    }
    
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingRequest]: any = await connection.query('SELECT * FROM recharge_requests WHERE id = ? FOR UPDATE', [id]);
    
    if (existingRequest.length === 0) {
        await connection.rollback();
        return NextResponse.json({ message: 'Solicitud no encontrada.' }, { status: 404 });
    }
    if (existingRequest[0].status !== 'pending') {
        await connection.rollback();
        return NextResponse.json({ message: 'Esta solicitud ya ha sido procesada.' }, { status: 409 });
    }

    // Update the request status first
    await connection.query('UPDATE recharge_requests SET status = ? WHERE id = ?', [status, id]);
    
    // If approved, handle the balance transfer from the system wallet
    if (status === 'approved') {
        const request = existingRequest[0];
        
        const [settings]: any = await connection.query("SELECT setting_value FROM settings WHERE setting_key = 'exchange_rate'");
        if (settings.length === 0) {
            await connection.rollback();
            throw new Error('Tasa de cambio no configurada.');
        }
        const VTC_EXCHANGE_RATE = parseFloat(settings[0].setting_value);
        if (isNaN(VTC_EXCHANGE_RATE) || VTC_EXCHANGE_RATE <= 0) {
            await connection.rollback();
            throw new Error('La tasa de cambio configurada es inválida.');
        }

        const vtcAmount = parseFloat(request.amountBs) / VTC_EXCHANGE_RATE;

        // Lock system wallet row
        const [systemWalletResult]: any = await connection.query('SELECT * FROM system_wallet WHERE currency_symbol = ? FOR UPDATE', [VTC_SYMBOL]);
        if (systemWalletResult.length === 0) {
            await connection.rollback();
            throw new Error('Billetera del sistema no encontrada.');
        }
        const systemWallet = systemWalletResult[0];

        if (systemWallet.uncirculated_balance < vtcAmount) {
            await connection.rollback();
            return NextResponse.json({ message: 'Fondos insuficientes en la billetera del sistema para completar la recarga.' }, { status: 500 });
        }

        // 1. Debit from system wallet
        await connection.query(
            'UPDATE system_wallet SET uncirculated_balance = uncirculated_balance - ? WHERE currency_symbol = ?',
            [vtcAmount, VTC_SYMBOL]
        );

        // 2. Credit user's wallet
        await connection.query(
            'UPDATE users SET vtc_balance = vtc_balance + ? WHERE id = ?',
            [vtcAmount, request.userId]
        );

        // 3. Create a transaction record for the user
        await connection.query(
            'INSERT INTO transactions (id, userId, type, amount_vtc, description) VALUES (?, ?, ?, ?, ?)',
            [`TXN-${uuidv4()}`, request.userId, 'top-up', vtcAmount, `Recarga aprobada por ${request.amountBs} Bs.`]
        );
    }
    
    await connection.commit();

    return NextResponse.json({ message: `Solicitud ${id} ha sido actualizada a ${status}.` }, { status: 200 });

  } catch (error) {
    if(connection) await connection.rollback();
    console.error('[API_RECHARGE_UPDATE_ERROR]', error);
    // Provide a more specific error message if it's a known error type
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
      if(connection) connection.release();
  }
}
