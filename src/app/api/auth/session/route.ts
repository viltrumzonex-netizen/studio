import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/hooks/use-auth';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('viltrum_session');

  if (!sessionCookie) {
    return NextResponse.json({ user: null, message: 'No hay sesión activa.' }, { status: 200 });
  }

  try {
    const user: User = JSON.parse(sessionCookie.value);
    // You might want to re-validate the user against the DB here in a real app
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    // If cookie is malformed, treat as no session
    return NextResponse.json({ user: null, message: 'Sesión inválida.' }, { status: 200 });
  }
}
