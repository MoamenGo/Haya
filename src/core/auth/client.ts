import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * The one Supabase client (CLAUDE.md §7.2: only src/core/auth and
 * src/core/sync may use it). The URL and the public "anon" key come from the
 * build's environment; when they are missing the app simply runs local-only.
 *
 * The anon key is safe in the browser: it only identifies the project. What
 * protects the data is Row Level Security (supabase/migrations).
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isCloudConfigured = Boolean(url && anonKey)

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isCloudConfigured) return null
  client ??= createClient(url as string, anonKey as string, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
  return client
}
