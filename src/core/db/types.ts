/**
 * Columns every synced row carries (see docs/erd.md).
 * The sync engine arrives in Phase 2; the columns exist from day one so
 * no data has to be migrated when it does.
 */
export interface SyncedRow {
  /** UUID v7, created on the device so rows can be made offline. */
  id: string
  /** Owner's account id. Null until the first sign-in (Phase 2) fills it. */
  user_id: string | null
  /** ISO timestamps from the device clock. `updated_at` decides sync conflicts. */
  created_at: string
  updated_at: string
  /** Soft delete: rows are hidden, never removed, so deletes can sync too. */
  deleted_at: string | null
  /** Local only: 1 = changed since the last push to the cloud. */
  _dirty: 0 | 1
}

export interface SettingRow extends SyncedRow {
  key: string
  value: unknown
}

export interface LifeAreaRow extends SyncedRow {
  name_ar: string
  name_en: string
  icon: string
  color: string
  sort_order: number
  archived: boolean
}
