import { useLiveQuery } from 'dexie-react-hooks'
import { weekSummary, type WeekSummary } from '@/core/planner/week'
import { listInbox } from '@/modules/inbox/repo'
import { logsBetween } from '@/modules/routines/repo'
import { tasksCompletedBetween } from '@/modules/tasks/repo'
import { dailyLogsBetween } from './repo'

export interface WeekFacts extends WeekSummary {
  inboxCount: number
}

/** The neutral facts shown at the top of the weekly review. `undefined` while loading. */
export function useWeekFacts(startISO: string, endISO: string): WeekFacts | undefined {
  return useLiveQuery(async () => {
    const [done, logs, habits, inbox] = await Promise.all([
      tasksCompletedBetween(startISO, endISO),
      dailyLogsBetween(startISO, endISO),
      logsBetween(startISO, endISO),
      listInbox(),
    ])
    return { ...weekSummary(done, logs, habits), inboxCount: inbox.length }
  }, [startISO, endISO])
}
