import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { User } from '@/hooks/use-auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Correo y contraseña son requeridos.' }, { status: 400 });
    }

    const [results]: any = await query(
      'SELECT id, email, displayName, role, password FROM users WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    const dbUser = results[0];

    // Corrected order: bcrypt.compare(plain_password, hash)
    const passwordMatches = await bcrypt.compare(password, dbUser.password);

    if (!passwordMatches) {
        return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    const user: User = {
      uid: dbUser.id.toString(),
      email: dbUser.email,
      displayName: dbUser.displayName,
      role: dbUser.role,
    };

    return NextResponse.json({ message: 'Inicio de sesión exitoso', user }, { status: 200 });

  } catch (error) {
    console.error('[API_LOGIN_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
