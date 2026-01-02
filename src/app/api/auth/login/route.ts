// IMPORTANT: This is a simplified example for demonstration.
// In a real production application, you MUST hash and salt passwords.
// Storing plaintext passwords is a major security risk.

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { User } from '@/hooks/use-auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Correo y contraseña son requeridos.' }, { status: 400 });
    }

    // In a real app, you'd SELECT ... WHERE email = ? and then compare the hashed password.
    // For this example, we're doing a direct lookup (INSECURE).
    const results: any = await query(
      'SELECT id, email, displayName, role FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (results.length === 0) {
      return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    const dbUser = results[0];

    // Format the user object to match the frontend's expected type
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
