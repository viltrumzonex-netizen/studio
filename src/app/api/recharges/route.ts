import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET /api/recharges - Fetch all recharge requests
export async function GET(req: NextRequest) {
  try {
    const results = await query(
      `SELECT r.*, u.email as userEmail 
       FROM recharge_requests r 
       JOIN users u ON r.userId = u.id 
       ORDER BY r.createdAt DESC`,
      []
    );
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('[API_RECHARGES_GET_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}

// POST /api/recharges - Create a new recharge request
export async function POST(req: NextRequest) {
  try {
    const { amountBs, method, reference, userId } = await req.json();

    if (!amountBs || !method || !reference || !userId) {
      return NextResponse.json({ message: 'Todos los campos son requeridos.' }, { status: 400 });
    }
    
    const id = `REQ-${uuidv4().slice(0, 8)}`;

    await query(
      'INSERT INTO recharge_requests (id, userId, amountBs, method, reference) VALUES (?, ?, ?, ?, ?)',
      [id, userId, amountBs, method, reference]
    );

    return NextResponse.json({ message: 'Solicitud de recarga creada exitosamente.', id }, { status: 201 });

  } catch (error) {
    console.error('[API_RECHARGE_CREATE_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
