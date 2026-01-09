
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Es importante loguear el error, pero no lanzar una excepción que rompa la app,
    // simplemente devolver null para que el código que lo llama pueda manejarlo.
    console.error("Supabase server error: Las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas.");
    return null;
  }

  // Este cliente se crea en cada solicitud del servidor, lo cual es correcto.
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // En Server Components, las cookies son de solo lectura, por lo que este bloque puede fallar.
            // Ignorar el error es el comportamiento esperado en este caso.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Similar al `set`, ignorar errores en Server Components.
          }
        },
      },
    }
  )
}
