/**
 * The sync state the UI shows (CLAUDE.md §7.3: synced ✓ / syncing / offline / error).
 * A tiny store: the scheduler writes it, React reads it with useSyncExternalStore.
 */
export type SyncPhase = 'signed_out' | 'offline' | 'syncing' | 'synced' | 'error'

export interface SyncStatus {
  phase: SyncPhase
  /** Local changes not uploaded yet. */
  pending: number
  lastSyncedAt: string | null
  /** Shown when the owner taps the indicator in the error state. */
  error: string | null
}

const INITIAL: SyncStatus = { phase: 'signed_out', pending: 0, lastSyncedAt: null, error: null }

let current: SyncStatus = INITIAL
const listeners = new Set<() => void>()

export function getSyncStatus(): SyncStatus {
  return current
}

export function setSyncStatus(change: Partial<SyncStatus>): void {
  current = { ...current, ...change }
  listeners.forEach((listener) => listener())
}

export function subscribeSyncStatus(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** For tests. */
export function resetSyncStatus(): void {
  current = INITIAL
}
