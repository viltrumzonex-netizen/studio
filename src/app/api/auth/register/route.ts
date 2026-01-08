import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/user-service';
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

    const existingUser = await findUserByEmail(email);
    
    if (existingUser) {
        return NextResponse.json({ message: 'El correo electrónico ya está en uso.' }, { status: 409 });
    }
    
    const newUser = await createUser({ email, password, displayName });
    
    const user: User = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role, 
    };

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
    const errorMessage = error instanceof Error ? `Error de Conexión: ${error.message}` : 'Error interno del servidor.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
