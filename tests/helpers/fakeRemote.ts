import { RemoteError, type SyncRemote, type WireRow } from '@/core/sync/remote'
import { NATURAL_KEYS, type SyncTable } from '@/core/sync/tables'

/**
 * An in-memory stand-in for the Supabase tables, close enough to test the sync
 * engine: upsert by id, a server stamp on every write, partial unique "one per
 * day" rules, and timestamps returned in Postgres's `+00:00` form.
 */
export class FakeRemote implements SyncRemote {
  readonly tables = new Map<SyncTable, Map<string, WireRow>>()
  private clock = Date.parse('2026-10-06T08:00:00Z')
  /** Runs before each push is stored; lets a test edit the local row "during" upload. */
  beforePush?: (table: SyncTable, rows: WireRow[]) => Promise<void>

  rows(table: SyncTable): WireRow[] {
    return [...(this.tables.get(table)?.values() ?? [])]
  }

  async push(table: SyncTable, rows: WireRow[]): Promise<void> {
    await this.beforePush?.(table, rows)
    const store = this.tables.get(table) ?? new Map<string, WireRow>()
    for (const row of rows) {
      const keys = NATURAL_KEYS[table]
      if (keys && !row.deleted_at) {
        const clash = [...store.values()].find(
          (other) =>
            other.id !== row.id && !other.deleted_at && keys.every((k) => other[k] === row[k]),
        )
        if (clash) throw new RemoteError(`duplicate key in ${table}`, '23505')
      }
      this.clock += 1
      store.set(row.id, { ...row, server_updated_at: postgresTime(this.clock) })
    }
    this.tables.set(table, store)
  }

  async pull(table: SyncTable, since: string | null, limit: number): Promise<WireRow[]> {
    const after = since ? Date.parse(since) : -Infinity
    return this.rows(table)
      .filter((r) => Date.parse(r.server_updated_at as string) > after)
      .sort(
        (a, b) =>
          Date.parse(a.server_updated_at as string) - Date.parse(b.server_updated_at as string),
      )
      .slice(0, limit)
      .map((r) => ({ ...r, created_at: postgresTime(Date.parse(r.created_at as string)) }))
  }
}

/** `2026-10-06T08:00:00.001+00:00`, the way Postgres/PostgREST writes instants. */
function postgresTime(ms: number): string {
  return new Date(ms).toISOString().replace('Z', '+00:00')
}
