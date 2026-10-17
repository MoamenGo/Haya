import { z } from 'zod'
import type { HayaDB } from '@/core/db/db'
import { NATURAL_KEYS, REFERENCES, SYNC_TABLES, type SyncTable } from '@/core/sync/tables'

/** Every table that belongs in a backup. New tables must be added here. */
export const BACKUP_TABLES = [
  'settings',
  'life_areas',
  'routines',
  'habit_logs',
  'daily_plans',
  'daily_logs',
  'inbox_items',
  'tasks',
  'projects',
  'goals',
  'day_overrides',
  'reviews',
  'resources',
  'learning_paths',
  'study_checks',
  'study_items',
  'notes',
] as const
export type BackupTable = (typeof BACKUP_TABLES)[number]

// The app was called Haya when backups began. The id stays, so every backup
// made before or after the rename to Khatwa (ADR-006) still imports.
const BACKUP_APP_ID = 'haya'

const rowSchema = z.looseObject({ id: z.string().min(1) })

export const backupSchema = z.object({
  app: z.literal(BACKUP_APP_ID),
  schema_version: z.number().int().positive(),
  exported_at: z.string(),
  tables: z.partialRecord(z.enum(BACKUP_TABLES), z.array(rowSchema)),
})
export type Backup = z.infer<typeof backupSchema>

/** Everything in the local database as one JSON-ready object (deleted rows included). */
export async function createBackup(db: HayaDB, now: Date = new Date()): Promise<Backup> {
  const tables: Backup['tables'] = {}
  for (const name of BACKUP_TABLES) {
    tables[name] = await db.table(name).toArray()
  }
  return {
    app: BACKUP_APP_ID,
    schema_version: db.verno,
    exported_at: now.toISOString(),
    tables,
  }
}

export interface ImportPreview {
  backup: Backup
  /** Per table: rows that would be added and rows that would replace existing ones. */
  counts: Record<BackupTable, { added: number; replaced: number }>
}

/**
 * Checks a backup file without changing anything (the "dry run").
 * Throws a readable error if the file is not a Haya backup or is newer than this app.
 */
export async function previewImport(db: HayaDB, json: unknown): Promise<ImportPreview> {
  const parsed = backupSchema.parse(json)
  if (parsed.schema_version > db.verno) {
    throw new Error('This backup comes from a newer version of the app. Update the app first.')
  }
  const backup = await matchExistingRows(db, parsed)
  const counts = {} as ImportPreview['counts']
  for (const name of BACKUP_TABLES) {
    const rows = backup.tables[name] ?? []
    const existing = await db.table(name).bulkGet(rows.map((r) => r.id))
    const replaced = existing.filter(Boolean).length
    counts[name] = { added: rows.length - replaced, replaced }
  }
  return { backup, counts }
}

type Row = Record<string, unknown> & { id: string }

/** For each table, the columns that point at another table: `[column, target]`. */
function outgoingReferences(table: SyncTable): Array<[string, SyncTable]> {
  const out: Array<[string, SyncTable]> = []
  for (const target of SYNC_TABLES) {
    for (const [from, column] of REFERENCES[target] ?? []) {
      if (from === table) out.push([column, target])
    }
  }
  return out
}

/**
 * A backup row and a row already on this device can be "the same thing" with
 * different ids: the starter areas, habits and study plans each device
 * created for itself, or the check-in for one evening. Such backup rows take
 * the local id (and rows pointing at them follow), so restoring replaces
 * them instead of colliding with a unique index or adding a duplicate.
 */
async function matchExistingRows(db: HayaDB, backup: Backup): Promise<Backup> {
  const idMaps = new Map<SyncTable, Map<string, string>>()
  const tables: Backup['tables'] = {}
  // Sync order: a table comes after the tables it points at.
  for (const name of SYNC_TABLES) {
    const incoming = (backup.tables[name as BackupTable] ?? []) as Row[]
    const refs = outgoingReferences(name)
    let rows = incoming.map((row) => {
      const copy: Row = { ...row }
      for (const [column, target] of refs) {
        const value = copy[column]
        const mapped = typeof value === 'string' ? idMaps.get(target)?.get(value) : undefined
        if (mapped) copy[column] = mapped
      }
      return copy
    })

    const keys = NATURAL_KEYS[name]
    if (keys) {
      const keyOf = (row: Record<string, unknown>) => JSON.stringify(keys.map((k) => row[k]))
      const local = new Map(
        ((await db.table(name).toArray()) as Row[]).map((row) => [keyOf(row), row.id]),
      )
      const map = new Map<string, string>()
      rows = rows.map((row) => {
        const localId = local.get(keyOf(row))
        if (!localId || localId === row.id) return row
        map.set(row.id, localId)
        return { ...row, id: localId }
      })
      idMaps.set(name, map)
    }
    tables[name as BackupTable] = rows
  }
  return { ...backup, tables }
}

/**
 * Writes a previewed backup into the database in one transaction:
 * either every row is written or none is. Rows are matched by `id`.
 */
export async function applyImport(db: HayaDB, preview: ImportPreview): Promise<void> {
  const tables = BACKUP_TABLES.map((name) => db.table(name))
  await db.transaction('rw', tables, async () => {
    for (const name of BACKUP_TABLES) {
      const rows = preview.backup.tables[name] ?? []
      // Marked dirty so the sync engine (Phase 2) uploads what was restored.
      await db.table(name).bulkPut(rows.map((row) => ({ ...row, _dirty: 1 })))
    }
  })
}
