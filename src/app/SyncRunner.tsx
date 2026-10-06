import { useEffect } from 'react'
import { currentSession } from '@/core/auth/auth'
import { getSupabase } from '@/core/auth/client'
import { db } from '@/core/db/db'
import { startSyncScheduler } from '@/core/sync/scheduler'
import { supabaseRemote } from '@/core/sync/supabaseRemote'

/**
 * Starts background sync once the app is open. Renders nothing. When the
 * build has no cloud settings it does nothing and the app stays local-only.
 */
export function SyncRunner() {
  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return
    const remote = supabaseRemote(supabase)
    const scheduler = startSyncScheduler({
      db,
      getContext: async () => {
        const session = await currentSession()
        return session ? { remote, userId: session.user.id } : null
      },
    })
    // Sync right after signing in, and show "signed out" right after signing out.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') void scheduler.syncNow()
    })
    return () => {
      data.subscription.unsubscribe()
      scheduler.stop()
    }
  }, [])
  return null
}
