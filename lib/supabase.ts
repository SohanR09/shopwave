import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const supabaseUrl = "https://rrldlxklvzwulgqjikfo.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybGRseGtsdnp3dWxncWppa2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTA0NzcsImV4cCI6MjA1OTA4NjQ3N30.izvARx34jIs7B61INaYvHsSkvEUhHbqROy742_RwBkI"

// Client-side singleton
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseBrowser = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
    })
  }
  return supabaseClient
}

// Server-side client (for server components and server actions)
export const getSupabaseServer = () => {
  return createClient("https://rrldlxklvzwulgqjikfo.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybGRseGtsdnp3dWxncWppa2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUxMDQ3NywiZXhwIjoyMDU5MDg2NDc3fQ.iZKMPZLxDYhdXK-eaA1hETJ172dIgiBUV1BwuJM3rLM", {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

