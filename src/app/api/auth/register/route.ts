import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { User } from '@/hooks/use-auth';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password || !displayName) {
      return NextResponse.json({ message: 'Correo, contraseña y nombre de usuario son requeridos.' }, { status: 400 });
    }
     if (password.length < 6) {
      return NextResponse.json({ message: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers: any = await query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUsers && existingUsers.length > 0) {
        return NextResponse.json({ message: 'El correo electrónico ya está en uso.' }, { status: 409 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const result: any = await query(
      'INSERT INTO users (email, password, displayName) VALUES (?, ?, ?)',
      [email, hashedPassword, displayName]
    );
    
    if (!result.insertId) {
        throw new Error('No se pudo crear el usuario.');
    }
    
    const newUserId = result.insertId;

    const user: User = {
        uid: newUserId.toString(),
        email,
        displayName,
        role: 'user', 
    };

    // Serialize the user data and set it in an httpOnly cookie
    const sessionCookie = serialize('viltrum_session', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    const response = NextResponse.json({ message: 'Usuario registrado exitosamente', user }, { status: 201 });
    response.headers.set('Set-Cookie', sessionCookie);

    return response;

  } catch (error) {
    console.error('[API_REGISTER_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
