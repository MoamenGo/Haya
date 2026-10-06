import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { HabitLogRow, HabitStatus, RoutineRow } from '@/core/db/types'

/** The only code that reads or writes `routines` and `habit_logs`. */

export async function listActiveRoutines(): Promise<RoutineRow[]> {
  const rows = await db.routines.orderBy('sort_order').toArray()
  return rows.filter((r) => r.active && !r.deleted_at)
}

/** Logs between two dates, inclusive (`YYYY-MM-DD`). */
export async function logsBetween(fromISO: string, toISO: string): Promise<HabitLogRow[]> {
  const rows = await db.habit_logs.where('date').between(fromISO, toISO, true, true).toArray()
  return rows.filter((l) => !l.deleted_at)
}

/**
 * Sets a routine's status for a day, or clears it with `null`.
 * There is at most one row per routine per day (unique index), so an
 * existing row is updated, and clearing is a soft delete that can sync.
 */
export async function setHabitStatus(
  routineId: string,
  dateISO: string,
  status: HabitStatus | null,
): Promise<void> {
  await db.transaction('rw', db.habit_logs, async () => {
    const existing = await db.habit_logs.where({ routine_id: routineId, date: dateISO }).first()
    if (existing) {
      const change =
        status === null ? { deleted_at: new Date().toISOString() } : { status, deleted_at: null }
      await db.habit_logs.update(existing.id, { ...change, ...touchMeta() })
    } else if (status !== null) {
      await db.habit_logs.add({ ...newRowMeta(), routine_id: routineId, date: dateISO, status })
    }
  })
}
