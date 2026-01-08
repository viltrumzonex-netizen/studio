
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Las variables de entorno son reemplazadas por Next.js en el momento de la compilación.
  // Este es el método correcto para acceder a ellas en el lado del cliente.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Las variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY) no están definidas. El cliente de Supabase no se puede crear.");
  }

  // Crea una nueva instancia del cliente en cada llamada para el cliente
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
