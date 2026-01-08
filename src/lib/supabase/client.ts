
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL and/or Anon Key are not defined. The app will not be able to connect to Supabase.");
    return null;
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
