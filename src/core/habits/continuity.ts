import type { HabitLogRow, HabitStatus } from '@/core/db/types'
import { lastDaysISO } from '@/core/time/date'

export interface ContinuityDay {
  date: string
  /** null = nothing logged. Shown as an empty dot, never as a failure. */
  status: HabitStatus | null
}

/** A routine's last `days` days for the gentle dot view (CLAUDE.md §6.5). */
export function continuity(
  logs: readonly HabitLogRow[],
  routineId: string,
  todayISO: string,
  days: number,
): ContinuityDay[] {
  const byDate = new Map(
    logs.filter((l) => l.routine_id === routineId && !l.deleted_at).map((l) => [l.date, l.status]),
  )
  return lastDaysISO(todayISO, days).map((date) => ({ date, status: byDate.get(date) ?? null }))
}

/** Full and minimum both count as done: the minimum is a successful day. */
export function isDone(status: HabitStatus | null): boolean {
  return status === 'full' || status === 'minimum'
}
