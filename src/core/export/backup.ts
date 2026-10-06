import { z } from 'zod'
import type { HayaDB } from '@/core/db/db'

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
] as const
export type BackupTable = (typeof BACKUP_TABLES)[number]

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
  const backup = backupSchema.parse(json)
  if (backup.schema_version > db.verno) {
    throw new Error('This backup comes from a newer version of the app. Update the app first.')
  }
  const counts = {} as ImportPreview['counts']
  for (const name of BACKUP_TABLES) {
    const rows = backup.tables[name] ?? []
    const existing = await db.table(name).bulkGet(rows.map((r) => r.id))
    const replaced = existing.filter(Boolean).length
    counts[name] = { added: rows.length - replaced, replaced }
  }
  return { backup, counts }
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
