import { useLiveQuery } from 'dexie-react-hooks'
import { continuity, type ContinuityDay } from '@/core/habits/continuity'
import type { HabitStatus, RoutineRow } from '@/core/db/types'
import { addDaysISO } from '@/core/time/date'
import { listActiveRoutines, logsBetween } from '@/modules/routines/repo'

export const CONTINUITY_DAYS = 7

export interface RoutineToday {
  routine: RoutineRow
  status: HabitStatus | null
  days: ContinuityDay[]
}

/** Active routines with today's status and their recent days. `undefined` while loading. */
export function useRoutinesToday(todayISO: string): RoutineToday[] | undefined {
  return useLiveQuery(async () => {
    const [routines, logs] = await Promise.all([
      listActiveRoutines(),
      logsBetween(addDaysISO(todayISO, 1 - CONTINUITY_DAYS), todayISO),
    ])
    return routines.map((routine) => {
      const days = continuity(logs, routine.id, todayISO, CONTINUITY_DAYS)
      return { routine, days, status: days[days.length - 1]?.status ?? null }
    })
  }, [todayISO])
}
