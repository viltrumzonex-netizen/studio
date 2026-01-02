import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PATCH /api/recharges/[id] - Update a recharge request status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status } = await req.json();

    if (!id || !status || !['approved', 'denied'].includes(status)) {
      return NextResponse.json({ message: 'ID de solicitud y estado válido son requeridos.' }, { status: 400 });
    }

    // First, check the current status to prevent re-processing
    const [existingRequest]: any = await query('SELECT status FROM recharge_requests WHERE id = ?', [id]);
    if (existingRequest.length === 0) {
        return NextResponse.json({ message: 'Solicitud no encontrada.' }, { status: 404 });
    }
    if (existingRequest[0].status !== 'pending') {
        return NextResponse.json({ message: 'Esta solicitud ya ha sido procesada.' }, { status: 409 });
    }


    // Update the request status
    await query('UPDATE recharge_requests SET status = ? WHERE id = ?', [status, id]);
    
    // If approved, we would also update the user's balance and create a transaction.
    // This logic can be expanded. For now, just updating the status.

    return NextResponse.json({ message: `Solicitud ${id} ha sido actualizada a ${status}.` }, { status: 200 });

  } catch (error) {
    console.error('[API_RECHARGE_UPDATE_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
