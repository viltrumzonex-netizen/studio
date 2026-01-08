import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return null or a mock client if you want the app to run without Supabase
    // This can be useful for local development or storybook
    console.error("Supabase URL and/or Anon Key are not defined. The app will not be able to connect to Supabase.");
    return null;
  }
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
