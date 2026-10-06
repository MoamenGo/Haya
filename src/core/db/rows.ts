import { v7 as uuidv7 } from 'uuid'
import type { SyncedRow } from './types'

/** Fills the sync columns for a brand-new row. */
export function newRowMeta(now: Date = new Date()): SyncedRow {
  const iso = now.toISOString()
  return {
    id: uuidv7(),
    user_id: null,
    created_at: iso,
    updated_at: iso,
    deleted_at: null,
    _dirty: 1,
  }
}

/** Sync columns to merge into a row that is being changed. */
export function touchMeta(now: Date = new Date()): Pick<SyncedRow, 'updated_at' | '_dirty'> {
  return { updated_at: now.toISOString(), _dirty: 1 }
}
