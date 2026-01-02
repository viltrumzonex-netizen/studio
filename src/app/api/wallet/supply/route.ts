import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Calculate the total circulating supply by summing up all user balances
    const [result]: any = await query(
      'SELECT SUM(vtc_balance) as circulatingSupply FROM users',
      []
    );

    const circulatingSupply = result[0].circulatingSupply || 0;

    return NextResponse.json({ circulatingSupply: parseFloat(circulatingSupply) }, { status: 200 });

  } catch (error) {
    console.error('[API_WALLET_SUPPLY_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
