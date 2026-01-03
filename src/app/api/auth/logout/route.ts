import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const sessionCookie = serialize('viltrum_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  });

  const response = NextResponse.json({ message: 'Cierre de sesión exitoso' }, { status: 200 });
  response.headers.set('Set-Cookie', sessionCookie);

  return response;
}
