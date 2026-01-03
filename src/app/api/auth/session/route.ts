import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const user = await getServerSession(req);

    if (!user) {
      return NextResponse.json({ message: 'No autenticado.' }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('[API_SESSION_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
