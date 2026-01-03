import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from '@/lib/session';
import type { PoolConnection } from 'mysql2/promise';

export async function POST(req: NextRequest) {
  let connection: PoolConnection | null = null;
  
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ message: 'No autenticado.' }, { status: 401 });
    }
    const senderId = session.uid;

    const { recipientEmail, amount, memo } = await req.json();

    if (!recipientEmail || !amount) {
      return NextResponse.json({ message: 'El destinatario y el monto son requeridos.' }, { status: 400 });
    }

    if (parseFloat(amount) <= 0) {
        return NextResponse.json({ message: 'El monto debe ser positivo.' }, { status: 400 });
    }

    if (session.email === recipientEmail) {
        return NextResponse.json({ message: 'No puedes enviarte fondos a ti mismo.' }, { status: 400 });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Lock rows for sender and recipient to prevent race conditions
    const [senderResult]: any = await connection.query('SELECT * FROM users WHERE id = ? FOR UPDATE', [senderId]);
    const [recipientResult]: any = await connection.query('SELECT * FROM users WHERE email = ? FOR UPDATE', [recipientEmail]);

    if (senderResult.length === 0) {
      await connection.rollback();
      return NextResponse.json({ message: 'Usuario remitente no encontrado.' }, { status: 404 });
    }
    if (recipientResult.length === 0) {
      await connection.rollback();
      return NextResponse.json({ message: 'El correo electrónico del destinatario no fue encontrado.' }, { status: 404 });
    }

    const sender = senderResult[0];
    const recipient = recipientResult[0];
    const transferAmount = parseFloat(amount);

    // 2. Check if sender has enough balance
    if (sender.vtc_balance < transferAmount) {
      await connection.rollback();
      return NextResponse.json({ message: 'Saldo insuficiente.' }, { status: 400 });
    }

    // 3. Perform the transfers
    const newSenderBalance = sender.vtc_balance - transferAmount;
    const newRecipientBalance = recipient.vtc_balance + transferAmount;

    await connection.query('UPDATE users SET vtc_balance = ? WHERE id = ?', [newSenderBalance, senderId]);
    await connection.query('UPDATE users SET vtc_balance = ? WHERE id = ?', [newRecipientBalance, recipient.id]);

    // 4. Create transaction records for both users
    const senderTxId = `TXN-${uuidv4()}`;
    const recipientTxId = `TXN-${uuidv4()}`;
    const description_out = memo ? `Envío a ${recipient.displayName}: ${memo}` : `Envío a ${recipient.displayName}`;
    const description_in = memo ? `Recibido de ${sender.displayName}: ${memo}` : `Recibido de ${sender.displayName}`;

    await connection.query(
      'INSERT INTO transactions (id, userId, type, amount_vtc, description) VALUES (?, ?, ?, ?, ?)',
      [senderTxId, senderId, 'transfer-out', transferAmount, description_out]
    );
    await connection.query(
      'INSERT INTO transactions (id, userId, type, amount_vtc, description) VALUES (?, ?, ?, ?, ?)',
      [recipientTxId, recipient.id, 'transfer-in', transferAmount, description_in]
    );

    // 5. Commit transaction
    await connection.commit();

    return NextResponse.json({ message: 'Transferencia realizada con éxito.' }, { status: 200 });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[API_TRANSACTION_SEND_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
