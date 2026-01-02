import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/store/items - Fetch all items for the store
export async function GET(req: NextRequest) {
  try {
    const results = await query(
      `SELECT id, name, description, price, stock FROM store_items WHERE stock > 0 ORDER BY price ASC`,
      []
    );
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('[API_STORE_ITEMS_GET_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
