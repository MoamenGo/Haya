import { useLiveQuery } from 'dexie-react-hooks'
import type { TaskRow } from '@/core/db/types'
import { dayLoad, type DayLoad } from '@/core/planner/week'
import { weekDaysISO } from '@/core/time/date'
import { daysInfo, type DayInfo } from '@/modules/days/repo'
import { dailyLogsBetween } from '@/modules/reviews/repo'
import { tasksBetween } from '@/modules/tasks/repo'
import { minimumModeDates } from '@/modules/today/repo'

export interface WeekDay extends DayInfo {
  tasks: TaskRow[]
  load: DayLoad
  checkedIn: boolean
  minimumMode: boolean
}

/** Everything the week view shows, for the 7 days from `startISO`. `undefined` while loading. */
export function useWeek(startISO: string): WeekDay[] | undefined {
  return useLiveQuery(async () => {
    const dates = weekDaysISO(startISO)
    const first = dates[0] ?? startISO
    const last = dates[dates.length - 1] ?? startISO
    const [infos, tasks, logs, minimum] = await Promise.all([
      daysInfo(dates),
      tasksBetween(first, last),
      dailyLogsBetween(first, last),
      minimumModeDates(first, last),
    ])
    const checkedIn = new Set(logs.map((l) => l.date))
    return infos.map((info) => {
      const dayTasks = tasks.filter((t) => t.scheduled_date === info.date)
      return {
        ...info,
        tasks: dayTasks,
        load: dayLoad(dayTasks, info.dayType, info.override?.capacity_min ?? null),
        checkedIn: checkedIn.has(info.date),
        minimumMode: minimum.has(info.date),
      }
    })
  }, [startISO])
}
