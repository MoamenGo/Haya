import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { watchSession } from '@/core/auth/auth'
import { getSyncStatus, subscribeSyncStatus, type SyncStatus } from '@/core/sync/status'

/** The current sign-in session. `undefined` while it is still being read. */
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => watchSession(setSession), [])
  return session
}

/** Live sync status, written by the background scheduler. */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatus)
}
