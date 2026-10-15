import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { LearningPathRow, LearningPathStatus } from '@/core/db/types'
import { MAX_ACTIVE_PATHS } from '@/core/learning/config'
import { startDateInput } from './schema'

/** The only code that reads or writes `learning_paths` and `study_checks`. */

export class TooManyActivePathsError extends Error {
  constructor() {
    super(`At most ${MAX_ACTIVE_PATHS} learning paths can be active.`)
  }
}

/** All plans, active first. */
export async function listPaths(): Promise<LearningPathRow[]> {
  const rows = await db.learning_paths.toArray()
  const order: Record<LearningPathStatus, number> = { active: 0, paused: 1, done: 2 }
  return rows
    .filter((r) => !r.deleted_at)
    .sort((a, b) => order[a.status] - order[b.status] || a.created_at.localeCompare(b.created_at))
}

export async function listActivePaths(): Promise<LearningPathRow[]> {
  return (await listPaths()).filter((p) => p.status === 'active')
}

/** Pause, resume or finish a plan. Resuming respects the active-paths limit. */
export async function setPathStatus(id: string, status: LearningPathStatus): Promise<void> {
  await db.transaction('rw', db.learning_paths, async () => {
    if (status === 'active') {
      const active = (await db.learning_paths.where('status').equals('active').toArray()).filter(
        (p) => !p.deleted_at && p.id !== id,
      )
      if (active.length >= MAX_ACTIVE_PATHS) throw new TooManyActivePathsError()
    }
    await db.learning_paths.update(id, { status, ...touchMeta() })
  })
}

export async function setPathStart(id: string, startDate: string): Promise<void> {
  const valid = startDateInput.parse(startDate)
  await db.learning_paths.update(id, { start_date: valid, ...touchMeta() })
}

/** Keys of a plan's ticked items. */
export async function checkedKeys(pathId: string): Promise<Set<string>> {
  const rows = await db.study_checks.where('path_id').equals(pathId).toArray()
  return new Set(rows.filter((r) => !r.deleted_at).map((r) => r.item_key))
}

/**
 * Ticks or unticks one plan item. An untick is a soft delete; ticking again
 * brings the same row back (one row per item, see the unique index).
 */
export async function setChecked(
  pathId: string,
  itemKey: string,
  checked: boolean,
  dateISO: string,
): Promise<void> {
  await db.transaction('rw', db.study_checks, async () => {
    const existing = await db.study_checks.where({ path_id: pathId, item_key: itemKey }).first()
    if (checked) {
      if (existing) {
        await db.study_checks.update(existing.id, {
          deleted_at: null,
          date: dateISO,
          ...touchMeta(),
        })
      } else {
        await db.study_checks.add({
          ...newRowMeta(),
          path_id: pathId,
          item_key: itemKey,
          date: dateISO,
        })
      }
    } else if (existing && !existing.deleted_at) {
      const meta = touchMeta()
      await db.study_checks.update(existing.id, { deleted_at: meta.updated_at, ...meta })
    }
  })
}
