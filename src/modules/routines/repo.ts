import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { HabitLogRow, HabitStatus, RoutineRow } from '@/core/db/types'
import { newRoutineInput, type NewRoutineInput } from './schema'

/** The only code that reads or writes `routines` and `habit_logs`. */

export async function listActiveRoutines(): Promise<RoutineRow[]> {
  const rows = await db.routines.orderBy('sort_order').toArray()
  return rows.filter((r) => r.active && !r.deleted_at)
}

/** Every habit that is not deleted, active and paused, in display order (for the Habits page). */
export async function listRoutines(): Promise<RoutineRow[]> {
  const rows = await db.routines.orderBy('sort_order').toArray()
  return rows.filter((r) => !r.deleted_at)
}

/** Adds a daily habit at the end of the list. New habits start active. */
export async function createRoutine(input: NewRoutineInput): Promise<RoutineRow> {
  const valid = newRoutineInput.parse(input)
  const last = await db.routines.orderBy('sort_order').last()
  const row: RoutineRow = {
    ...newRowMeta(),
    ...valid,
    area_id: null,
    rrule: 'FREQ=DAILY',
    duration_min: null,
    commitment_level: valid.is_worship ? 1 : 2,
    active: true,
    sort_order: (last?.sort_order ?? 0) + 1,
  }
  await db.routines.add(row)
  return row
}

/** Pausing hides a habit from Today but keeps its history, so it can come back. */
export async function setRoutineActive(routineId: string, active: boolean): Promise<void> {
  await db.routines.update(routineId, { active, ...touchMeta() })
}

/** Soft delete, so the deletion can sync. Its old logs stay in the backup. */
export async function deleteRoutine(routineId: string): Promise<void> {
  await db.routines.update(routineId, { deleted_at: new Date().toISOString(), ...touchMeta() })
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
