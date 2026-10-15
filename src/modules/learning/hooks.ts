import { useLiveQuery } from 'dexie-react-hooks'
import type { LearningPathRow } from '@/core/db/types'
import { CURRICULA, defaultWeekDayTypes, planProgress } from '@/core/learning/plan'
import { planStartISO, planWeekOn } from '@/core/learning/week'
import { isMinimumMode } from '@/modules/today/repo'
import { checkedKeys, listActivePaths, listPaths } from './repo'
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

/** One plan as the plans screen shows it. */
export interface PathSummary {
  path: LearningPathRow
  /** Plan week today: 0 = not started, above `totalWeeks` = finished. */
  week: number
  totalWeeks: number
  /** Ticked share of the whole plan, 0–1. */
  progress: number
}

/** Every plan with where it stands today. `undefined` while loading. */
export function usePathSummaries(todayISO: string): PathSummary[] | undefined {
  return useLiveQuery(async () => {
    const paths = await listPaths()
    const usualWeek = defaultWeekDayTypes()
    return Promise.all(
      paths.map(async (path) => {
        const curriculum = CURRICULA[path.curriculum_key]
        const done = await checkedKeys(path.id)
        return {
          path,
          week: planWeekOn(path.start_date, todayISO),
          totalWeeks: curriculum.totalWeeks,
          progress: planProgress(curriculum, usualWeek, done),
        }
      }),
    )
  }, [todayISO])
}
