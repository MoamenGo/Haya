import type { DailyLogRow, HabitLogRow, TaskRow } from '@/core/db/types'
import { dayCapacity, type Capacity } from './capacity'
import type { DayType } from '@/core/time/config'

export interface DayLoad {
  capacity: Capacity
  total: number
  done: number
  bigRocks: number
}

/** How full one day is: open tasks' estimates against that day's capacity. */
export function dayLoad(
  tasks: readonly TaskRow[],
  dayType: DayType,
  customMinutes: number | null = null,
): DayLoad {
  const planned = tasks
    .filter((t) => t.status !== 'done')
    .reduce((sum, t) => sum + (t.est_minutes ?? 0), 0)
  return {
    capacity: dayCapacity(dayType, planned, { customMinutes }),
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'done').length,
    bigRocks: tasks.filter((t) => t.is_big_rock).length,
  }
}

export interface WeekSummary {
  tasksDone: number
  /** Evenings with a check-in. */
  checkIns: number
  /** Average of the energies logged; null when none were. */
  averageEnergy: number | null
  /** Days with at least one routine done (full or minimum). */
  habitDays: number
}

const ENERGY_DECIMALS = 10

/** Neutral facts for the weekly review. Reflection, not a score. */
export function weekSummary(
  tasks: readonly TaskRow[],
  logs: readonly DailyLogRow[],
  habitLogs: readonly HabitLogRow[],
): WeekSummary {
  const energies = logs.map((l) => l.energy).filter((e): e is number => e !== null)
  const average = energies.length
    ? Math.round((energies.reduce((a, b) => a + b, 0) / energies.length) * ENERGY_DECIMALS) /
      ENERGY_DECIMALS
    : null
  const habitDates = new Set(habitLogs.filter((h) => h.status !== 'skipped').map((h) => h.date))
  return {
    tasksDone: tasks.filter((t) => t.status === 'done').length,
    checkIns: logs.length,
    averageEnergy: average,
    habitDays: habitDates.size,
  }
}
