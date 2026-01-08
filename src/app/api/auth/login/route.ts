import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/user-service';
import type { User } from '@/hooks/use-auth';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Correo y contraseña son requeridos.' }, { status: 400 });
    }

    const dbUser = await findUserByEmail(email);

    if (!dbUser) {
      return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, dbUser.password);

    if (!passwordMatches) {
        return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    const user: User = {
      uid: String(dbUser.id),
      email: dbUser.email,
      displayName: dbUser.displayName,
      role: dbUser.role || 'user',
    };
    
    const sessionCookie = serialize('viltrum_session', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    const response = NextResponse.json({ message: 'Inicio de sesión exitoso', user }, { status: 200 });
    response.headers.set('Set-Cookie', sessionCookie);

    return response;

  } catch (error) {
    console.error('[API_LOGIN_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
