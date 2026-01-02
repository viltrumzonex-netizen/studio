import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { PoolConnection } from 'mysql2/promise';

// PATCH /api/recharges/[id] - Update a recharge request status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let connection: PoolConnection | null = null;
  try {
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

    // Update the request status
    await connection.query('UPDATE recharge_requests SET status = ? WHERE id = ?', [status, id]);
    
    if (status === 'approved') {
        const request = existingRequest[0];
        
        // Get exchange rate from the database
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

        // Update user's balance
        await connection.query(
            'UPDATE users SET vtc_balance = vtc_balance + ? WHERE id = ?',
            [vtcAmount, request.userId]
        );

        // Create a transaction record
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
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  } finally {
      if(connection) connection.release();
  }
}
