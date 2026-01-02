import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const [result]: any = await query(
      'SELECT COUNT(*) as userCount FROM users',
      []
    );

    const userCount = result[0].userCount || 0;

    return NextResponse.json({ userCount: parseInt(userCount) }, { status: 200 });

  } catch (error) {
    console.error('[API_USERS_COUNT_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
