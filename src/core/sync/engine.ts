import type { Table } from 'dexie'
import { v7 as uuidv7 } from 'uuid'
import type { HayaDB } from '@/core/db/db'
import { PULL_OVERLAP_MS, PULL_PAGE_SIZE, PUSH_BATCH_SIZE } from './config'
import type { SyncRemote, WireRow } from './remote'
import { INSTANT_COLUMNS, NATURAL_KEYS, REFERENCES, SYNC_TABLES, type SyncTable } from './tables'

/**
 * The sync engine (CLAUDE.md §7.3). One call to `syncOnce`:
 *   1. pulls every table: rows changed in the cloud since this device's cursor;
 *   2. pushes every table: local rows marked `_dirty = 1`.
 *
 * Pulling first lets the device merge rows another device created for the
 * same day before uploading its own, so the cloud never gets duplicates.
 * Conflicts are rare (one person, two devices) and resolved last-write-wins by
 * `updated_at`; every one is logged in the local `sync_conflicts` table.
 */

/** A local row: whatever the table stores, plus the sync columns. */
type LocalRow = WireRow & { updated_at: string; deleted_at: string | null; _dirty: 0 | 1 }

export interface SyncResult {
  pulled: number
  pushed: number
  conflicts: number
}

export async function syncOnce(
  db: HayaDB,
  remote: SyncRemote,
  userId: string,
  now: () => Date = () => new Date(),
): Promise<SyncResult> {
  const result: SyncResult = { pulled: 0, pushed: 0, conflicts: 0 }
  for (const table of SYNC_TABLES) {
    const pulled = await pullTable(db, remote, table, now)
    result.pulled += pulled.rows
    result.conflicts += pulled.conflicts
  }
  for (const table of SYNC_TABLES) {
    result.pushed += await pushTable(db, remote, table, userId)
  }
  return result
}

// ---------------------------------------------------------------------------
// Pull
// ---------------------------------------------------------------------------

async function pullTable(
  db: HayaDB,
  remote: SyncRemote,
  table: SyncTable,
  now: () => Date,
): Promise<{ rows: number; conflicts: number }> {
  const cursor = (await db.sync_state.get(table))?.cursor ?? null
  let since = cursor ? new Date(Date.parse(cursor) - PULL_OVERLAP_MS).toISOString() : null
  let newest = cursor
  let rows = 0
  let conflicts = 0

  for (;;) {
    const page = (await remote.pull(table, since, PULL_PAGE_SIZE)).map((w) => fromWire(table, w))
    conflicts += await applyPage(db, table, page, now)
    for (const row of page) {
      const stamp = row.server_updated_at as string
      if (!newest || stamp > newest) newest = stamp
      since = stamp
    }
    rows += page.length
    if (page.length < PULL_PAGE_SIZE) break
  }

  if (newest !== cursor) await db.sync_state.put({ table, cursor: newest })
  return { rows, conflicts }
}

/** Writes a page of cloud rows in one transaction. Returns how many were conflicts. */
async function applyPage(
  db: HayaDB,
  table: SyncTable,
  page: LocalRow[],
  now: () => Date,
): Promise<number> {
  if (page.length === 0) return 0
  const refTables = (REFERENCES[table] ?? []).map(([name]) => db.table(name))
  return db.transaction('rw', [db.table(table), db.sync_conflicts, ...refTables], async () => {
    let conflicts = 0
    for (const row of page) {
      if (await applyRemoteRow(db, table, row, now)) conflicts += 1
    }
    return conflicts
  })
}

/**
 * Writes one cloud row into the local database (inside `applyPage`'s
 * transaction). Returns true if it disagreed with a local change that wasn't
 * uploaded yet (a conflict, logged either way).
 */
async function applyRemoteRow(
  db: HayaDB,
  table: SyncTable,
  remoteRow: LocalRow,
  now: () => Date,
): Promise<boolean> {
  const local = db.table<LocalRow, string>(table)
  const existing = await local.get(remoteRow.id)
  if (existing) {
    // Already have this exact version (pulls re-read a short overlap window).
    if (isSameOrOlderVersion(remoteRow, existing)) return false
    // Same row on both sides. A local edit not yet uploaded wins only if it is newer.
    if (existing._dirty === 1 && sameContent(existing, remoteRow)) {
      await local.put(remoteRow)
      return false
    }
    if (existing._dirty === 1) {
      const keepLocal = isNewer(existing, remoteRow)
      await logConflict(db, table, existing, remoteRow, keepLocal ? 'local' : 'remote', now)
      if (keepLocal) return true
      await local.put(remoteRow)
      return true
    }
    await local.put(remoteRow)
    return false
  }

  // A new id here. Did this device make its own row for the same thing?
  const twin = await findTwin(local, table, remoteRow)
  if (!twin) {
    await local.put(remoteRow)
    return false
  }
  // A deleted cloud row never replaces a live local one; there is nothing to keep from it.
  if (remoteRow.deleted_at) return false

  // Merge the two into the cloud's id, so both devices end up with one row.
  const keepLocal = twin._dirty === 1 && isNewer(twin, remoteRow)
  const merged: LocalRow = keepLocal
    ? {
        ...twin,
        id: remoteRow.id,
        user_id: remoteRow.user_id,
        created_at: remoteRow.created_at,
        server_updated_at: remoteRow.server_updated_at,
        _dirty: 1,
      }
    : remoteRow
  await local.delete(twin.id)
  await local.put(merged)
  await repoint(db, table, twin.id, remoteRow.id, now)
  if (twin._dirty === 1 && !sameContent(twin, remoteRow)) {
    await logConflict(db, table, twin, remoteRow, keepLocal ? 'local' : 'remote', now)
    return true
  }
  return false
}

/** Columns that describe the row's bookkeeping rather than what the owner wrote. */
const META_COLUMNS = new Set([
  'id',
  'user_id',
  'created_at',
  'updated_at',
  'server_updated_at',
  '_dirty',
])

/** True when two versions say the same thing, so there is nothing to choose between. */
function sameContent(a: LocalRow, b: LocalRow): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)].filter((k) => !META_COLUMNS.has(k)))
  return [...keys].every((k) => JSON.stringify(a[k] ?? null) === JSON.stringify(b[k] ?? null))
}

function isSameOrOlderVersion(remote: LocalRow, local: LocalRow): boolean {
  const seen = local.server_updated_at
  return (
    typeof seen === 'string' && Date.parse(remote.server_updated_at as string) <= Date.parse(seen)
  )
}

function isNewer(a: { updated_at: string }, b: { updated_at: string }): boolean {
  return Date.parse(a.updated_at) > Date.parse(b.updated_at)
}

/** The local row with the same natural key but a different id, if any. */
async function findTwin(
  local: Table<LocalRow, string>,
  table: SyncTable,
  row: LocalRow,
): Promise<LocalRow | undefined> {
  const keys = NATURAL_KEYS[table]
  if (!keys) return undefined
  const values = keys.map((k) => row[k])
  if (values.some((v) => v === null || v === undefined)) return undefined

  // Use the matching index when the table has one; otherwise scan (small tables only).
  const indexName = keys.length === 1 ? keys[0] : `[${keys.join('+')}]`
  const hasIndex = local.schema.indexes.some((i) => i.name === indexName)
  const candidates = hasIndex
    ? await local
        .where(indexName as string)
        .equals(keys.length === 1 ? (values[0] as string) : (values as string[]))
        .toArray()
    : await local.filter((r) => keys.every((k, i) => r[k] === values[i])).toArray()
  return candidates.find((r) => r.id !== row.id)
}

/** After a merge, rows that pointed at the old id point at the kept one (and will upload). */
async function repoint(
  db: HayaDB,
  table: SyncTable,
  fromId: string,
  toId: string,
  now: () => Date,
): Promise<void> {
  for (const [refTable, column] of REFERENCES[table] ?? []) {
    await db
      .table(refTable)
      .filter((r: Record<string, unknown>) => r[column] === fromId)
      .modify({ [column]: toId, updated_at: now().toISOString(), _dirty: 1 })
  }
}

async function logConflict(
  db: HayaDB,
  table: SyncTable,
  local: LocalRow,
  remote: LocalRow,
  kept: 'local' | 'remote',
  now: () => Date,
): Promise<void> {
  await db.sync_conflicts.add({
    id: uuidv7(),
    table,
    row_id: remote.id,
    kept,
    local,
    remote,
    at: now().toISOString(),
  })
}

/** A cloud row in the shape the app stores: `Z` timestamps, marked clean. */
function fromWire(table: SyncTable, wire: WireRow): LocalRow {
  const row: Record<string, unknown> = { ...wire, _dirty: 0 }
  for (const column of INSTANT_COLUMNS[table]) {
    const value = row[column]
    if (typeof value === 'string') row[column] = new Date(value).toISOString()
  }
  return row as LocalRow
}

// ---------------------------------------------------------------------------
// Push
// ---------------------------------------------------------------------------

async function pushTable(
  db: HayaDB,
  remote: SyncRemote,
  table: SyncTable,
  userId: string,
): Promise<number> {
  const local = db.table<LocalRow, string>(table)
  const dirty = await local.where('_dirty').equals(1).toArray()
  for (let i = 0; i < dirty.length; i += PUSH_BATCH_SIZE) {
    const batch = dirty.slice(i, i + PUSH_BATCH_SIZE)
    await remote.push(
      table,
      batch.map((row) => toWire(row, userId)),
    )
    // Clear the flag only where the row wasn't edited again while uploading;
    // an edit made meanwhile stays dirty and goes up next time.
    await db.transaction('rw', local, async () => {
      for (const sent of batch) {
        const current = await local.get(sent.id)
        if (current && current.updated_at === sent.updated_at) {
          await local.update(sent.id, { _dirty: 0, user_id: userId })
        }
      }
    })
  }
  return dirty.length
}

/** Drops local-only columns and stamps the owner. The server sets its own timestamp. */
function toWire(row: LocalRow, userId: string): WireRow {
  const { _dirty, server_updated_at, ...rest } = row
  void _dirty
  void server_updated_at
  return { ...rest, user_id: userId }
}
