
import { createBrowserClient } from '@supabase/ssr'

// Define un tipo para las variables de entorno para mayor seguridad.
type SupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

// Lee las variables de entorno una sola vez.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Inicializa el cliente una sola vez y expórtalo.
// Esto evita problemas de reinicialización y asegura un singleton.
let supabaseSingleton: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Las variables de entorno de Supabase no están definidas. El cliente de Supabase no se puede crear.");
  }

  // Crea el cliente solo si no ha sido creado previamente.
  if (!supabaseSingleton) {
    supabaseSingleton = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey
    );
  }

  return supabaseSingleton;
}
