import { useLiveQuery } from 'dexie-react-hooks'
import { planStartISO } from '@/core/learning/week'
import { isMinimumMode } from '@/modules/today/repo'
import { listActivePaths } from './repo'
import { studyWeek, type PathSession } from './sessions'

export interface StudyToday {
  sessions: PathSession[]
  /** When no plan has started yet: the first start date coming up. */
  nextStart: string | null
}

/** Today's study sessions of every active plan. `undefined` while loading. */
export function useStudyToday(todayISO: string): StudyToday | undefined {
  return useLiveQuery(async () => {
    const minimum = (await isMinimumMode(todayISO)) ? new Set([todayISO]) : new Set<string>()
    const [week, paths] = await Promise.all([studyWeek(todayISO, minimum), listActivePaths()])
    const upcoming = paths
      .map((p) => planStartISO(p.start_date))
      .filter((start) => start > todayISO)
      .sort()
    return { sessions: week.get(todayISO) ?? [], nextStart: upcoming[0] ?? null }
  }, [todayISO])
}
