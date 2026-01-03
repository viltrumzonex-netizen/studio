import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { User } from '@/hooks/use-auth';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Correo y contraseña son requeridos.' }, { status: 400 });
    }

    const results: any = await query(
      'SELECT id, email, displayName, role, password FROM users WHERE email = ?',
      [email]
    );

    if (!results || results.length === 0) {
      return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    const dbUser = results[0];

    const passwordMatches = await bcrypt.compare(password, dbUser.password);

    if (!passwordMatches) {
        return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    const user: User = {
      uid: String(dbUser.id),
      email: dbUser.email,
      displayName: dbUser.displayName,
      // Ensure role is valid, default to 'user' if null/undefined
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
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
