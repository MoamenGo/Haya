import type { SyncTable } from './tables'

/** A row as it travels to and from the cloud. */
export type WireRow = Record<string, unknown> & { id: string }

/**
 * What the sync engine needs from the cloud. The real one talks to Supabase
 * (added with sign-in); tests use an in-memory one. Keeping the engine behind
 * this interface means it can be tested without a network.
 */
export interface SyncRemote {
  /** Insert or replace rows by `id`. Throws `RemoteError` on failure. */
  push(table: SyncTable, rows: WireRow[]): Promise<void>
  /**
   * Rows whose `server_updated_at` is after `since` (or all rows when null),
   * oldest first, at most `limit`.
   */
  pull(table: SyncTable, since: string | null, limit: number): Promise<WireRow[]>
}

export class RemoteError extends Error {
  /** Postgres error code when there is one, e.g. 23505 = unique violation. */
  readonly code: string | undefined

  constructor(message: string, code?: string) {
    super(message)
    this.code = code
  }
}
