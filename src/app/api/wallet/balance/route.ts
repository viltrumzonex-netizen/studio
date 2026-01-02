import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'User ID es requerido.' }, { status: 400 });
    }

    // Get user balance
    const [userResult]: any = await query(
      'SELECT vtc_balance FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.length === 0) {
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    const balance = userResult[0].vtc_balance;

    // Get user transactions
    const [transactions]: any = await query(
      'SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    return NextResponse.json({ balance, transactions }, { status: 200 });

  } catch (error) {
    console.error('[API_WALLET_BALANCE_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
