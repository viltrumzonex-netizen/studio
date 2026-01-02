import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/settings - Fetch all settings
export async function GET(req: NextRequest) {
  try {
    const results = await query('SELECT * FROM settings', []);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('[API_SETTINGS_GET_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}

// POST /api/settings - Update a setting
export async function POST(req: NextRequest) {
  try {
    const { key, value } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json({ message: 'La clave y el valor son requeridos.' }, { status: 400 });
    }

    // Use INSERT ... ON DUPLICATE KEY UPDATE to either insert a new setting or update an existing one.
    // This is more robust than separate INSERT and UPDATE statements.
    await query(
      'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [key, value, value]
    );

    return NextResponse.json({ message: `Configuración '${key}' actualizada.` }, { status: 200 });

  } catch (error) {
    console.error('[API_SETTINGS_POST_ERROR]', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
