import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const user = await getServerSession(req);

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('[API_SESSION_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
