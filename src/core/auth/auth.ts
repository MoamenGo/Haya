import type { Session } from '@supabase/supabase-js'
import { getSupabase } from './client'

/**
 * Sign-in by email (CLAUDE.md §7.4). Supabase emails a link and a 6-digit
 * code. The code matters on iPhone: a link opens Safari, which doesn't share
 * storage with the installed app, so typing the code signs in the app itself.
 */

/** Where the link in the email returns to. A page without redirects, so the token survives. */
const RETURN_PATH = '/settings'

export async function sendSignInEmail(email: string): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}${RETURN_PATH}` },
  })
  if (error) throw error
}

export async function verifySignInCode(email: string, code: string): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
  if (error) throw error
}

/** Signs out on this device. Local data stays; it syncs again after the next sign-in. */
export async function signOut(): Promise<void> {
  const { error } = await requireClient().auth.signOut({ scope: 'local' })
  if (error) throw error
}

export async function currentSession(): Promise<Session | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

/** Calls back with the session now and whenever it changes. Returns an unsubscribe. */
export function watchSession(callback: (session: Session | null) => void): () => void {
  const supabase = getSupabase()
  if (!supabase) {
    callback(null)
    return () => undefined
  }
  void currentSession().then(callback)
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

function requireClient() {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Cloud sync is not set up in this build.')
  return supabase
}
