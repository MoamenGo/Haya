import { liveQuery } from 'dexie'
import type { HayaDB } from '@/core/db/db'
import { SYNC_DEBOUNCE_MS, SYNC_INTERVAL_MS } from './config'
import { syncOnce } from './engine'
import type { SyncNudge } from './nudge'
import type { SyncRemote } from './remote'
import { setSyncStatus } from './status'
import { SYNC_TABLES } from './tables'

/** Who to sync as and through what. Null while signed out. */
export interface SyncContext {
  remote: SyncRemote
  userId: string
}

export interface SchedulerOptions {
  db: HayaDB
  getContext: () => Promise<SyncContext | null>
  isOnline?: () => boolean
  /** Tells the other devices "something changed" and hears them say it. Optional. */
  nudge?: SyncNudge
}

/**
 * Decides *when* to sync (CLAUDE.md §7.3): on start, when the network comes
 * back, when the app is shown again, shortly after local changes, when
 * another device says it uploaded something, and every minute while on screen. Only one sync runs at a time; a request that
 * arrives meanwhile runs once more right after.
 *
 * Returns `stop`, plus `syncNow` for a manual "sync" tap.
 */
export function startSyncScheduler({
  db,
  getContext,
  isOnline = () => navigator.onLine,
  nudge,
}: SchedulerOptions): { stop: () => void; syncNow: () => Promise<void> } {
  let running: Promise<void> | null = null
  let again = false
  let debounce: ReturnType<typeof setTimeout> | undefined

  async function runOnce(): Promise<void> {
    const context = await getContext()
    nudge?.refresh()
    if (!context) {
      setSyncStatus({ phase: 'signed_out', error: null })
      return
    }
    if (!isOnline()) {
      setSyncStatus({ phase: 'offline' })
      return
    }
    setSyncStatus({ phase: 'syncing' })
    try {
      const result = await syncOnce(db, context.remote, context.userId)
      if (result.pushed > 0) nudge?.send()
      setSyncStatus({ phase: 'synced', lastSyncedAt: new Date().toISOString(), error: null })
    } catch (error) {
      setSyncStatus({
        phase: 'error',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  function syncNow(): Promise<void> {
    if (running) {
      again = true
      return running
    }
    running = (async () => {
      do {
        again = false
        await runOnce()
      } while (again)
      running = null
    })()
    return running
  }

  // Count rows waiting to upload; any change to that count is a local write.
  const pending = liveQuery(async () => {
    const counts = await Promise.all(
      SYNC_TABLES.map((table) => db.table(table).where('_dirty').equals(1).count()),
    )
    return counts.reduce((a, b) => a + b, 0)
  }).subscribe({
    next: (count) => {
      setSyncStatus({ pending: count })
      clearTimeout(debounce)
      if (count > 0) debounce = setTimeout(() => void syncNow(), SYNC_DEBOUNCE_MS)
    },
  })

  const onOnline = () => void syncNow()
  const onOffline = () => setSyncStatus({ phase: 'offline' })
  const onVisible = () => {
    if (document.visibilityState === 'visible') void syncNow()
  }
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  document.addEventListener('visibilitychange', onVisible)
  // Polling is only a safety net, so skip it while the app is in the background.
  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') void syncNow()
  }, SYNC_INTERVAL_MS)
  const stopListening = nudge?.listen(() => void syncNow())
  void syncNow()

  return {
    syncNow,
    stop() {
      pending.unsubscribe()
      clearTimeout(debounce)
      clearInterval(interval)
      stopListening?.()
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      document.removeEventListener('visibilitychange', onVisible)
    },
  }
}
