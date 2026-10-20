import { useLiveQuery } from 'dexie-react-hooks'
import type { TaskRow } from '@/core/db/types'
import { monthGridISO } from '@/core/time/calendar'
import { daysInfo, type DayInfo } from '@/modules/days/repo'
import { tasksBetween } from '@/modules/tasks/repo'

export interface CalendarDay extends DayInfo {
  tasks: TaskRow[]
}

export interface CalendarMonth {
  weeks: string[][]
  days: ReadonlyMap<string, CalendarDay>
}

/**
 * The weeks drawn for a month and, for every date in them, its day type and
 * tasks. One query for the tasks of the whole grid. `undefined` while loading.
 */
export function useMonth(anyDateInMonth: string): CalendarMonth | undefined {
  return useLiveQuery(async () => {
    const weeks = monthGridISO(anyDateInMonth)
    const dates = weeks.flat()
    const first = dates[0] ?? anyDateInMonth
    const last = dates[dates.length - 1] ?? anyDateInMonth
    const [infos, tasks] = await Promise.all([daysInfo(dates), tasksBetween(first, last)])
    const days = new Map(
      infos.map((info) => [
        info.date,
        { ...info, tasks: tasks.filter((task) => task.scheduled_date === info.date) },
      ]),
    )
    return { weeks, days }
  }, [anyDateInMonth])
}
