
'use client';

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Faltan variables de entorno de Supabase. El cliente no se puede inicializar.");
    throw new Error("Faltan variables de entorno de Supabase. El cliente no se puede inicializar.");
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
