
import { createBrowserClient } from '@supabase/ssr'

// Se leen las variables de entorno una sola vez, en el nivel superior del módulo.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Se crea una única instancia del cliente de Supabase.
// Si las variables no están definidas, esto lanzará un error claro durante la inicialización.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and/or Anon Key are not defined in .env file. The Supabase client cannot be created.");
}

const supabase = createBrowserClient(
  supabaseUrl!,
  supabaseAnonKey!
);

// La función ahora devuelve la instancia única y ya configurada.
export function createClient() {
  return supabase;
}
