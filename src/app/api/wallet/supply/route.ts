import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { VTC_SYMBOL } from '@/lib/constants';

export async function GET() {
  try {
    // New logic: Circulating supply is the total supply minus what's left in the bank.
    const [result]: any = await query(
      'SELECT total_supply, uncirculated_balance FROM system_wallet WHERE currency_symbol = ?',
      [VTC_SYMBOL]
    );

    if (result.length === 0) {
      // Fallback or error if system wallet is not initialized
      return NextResponse.json({ circulatingSupply: 0 }, { status: 200 });
    }

    const totalSupply = parseFloat(result[0].total_supply);
    const uncirculatedBalance = parseFloat(result[0].uncirculated_balance);
    const circulatingSupply = totalSupply - uncirculatedBalance;
    
    return NextResponse.json({ circulatingSupply }, { status: 200 });

  } catch (error) {
    console.error('[API_WALLET_SUPPLY_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
