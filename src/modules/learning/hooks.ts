import { useLiveQuery } from 'dexie-react-hooks'
import type { LearningPathRow } from '@/core/db/types'
import { editableWeek, type EditableStep } from '@/core/learning/edits'
import {
  baseCurriculum,
  curriculumFor,
  defaultWeekDayTypes,
  planProgress,
} from '@/core/learning/plan'
import type { Curriculum, WeekOverview } from '@/core/learning/types'
import { planStartISO, planWeekDates, planWeekOn } from '@/core/learning/week'
import type { DayType } from '@/core/time/config'
import { daysInfo } from '@/modules/days/repo'
import { isMinimumMode } from '@/modules/today/repo'
import { checkedKeys, getPath, listActivePaths, listItemEdits, listPaths } from './repo'
import { studyWeek, type PathSession } from './sessions'

export interface StudyToday {
  sessions: PathSession[]
  /** When no plan has started yet: the first start date coming up. */
  nextStart: string | null
  /** How many plans are active, for the link to the plans screen. */
  activePlans: number
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
    return {
      sessions: week.get(todayISO) ?? [],
      nextStart: upcoming[0] ?? null,
      activePlans: paths.length,
    }
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
  /** What the current (or first) week is about. */
  overview: WeekOverview
}

async function summarize(path: LearningPathRow, todayISO: string): Promise<PathSummary> {
  const curriculum = curriculumFor(path, await listItemEdits(path.id))
  const done = await checkedKeys(path.id)
  const week = planWeekOn(path.start_date, todayISO)
  const shown = Math.min(Math.max(week, 1), curriculum.totalWeeks)
  return {
    path,
    week,
    totalWeeks: curriculum.totalWeeks,
    progress: planProgress(curriculum, defaultWeekDayTypes(), done),
    overview: curriculum.overview(shown),
  }
}

/** Every plan with where it stands today. `undefined` while loading. */
export function usePathSummaries(todayISO: string): PathSummary[] | undefined {
  return useLiveQuery(async () => {
    const paths = await listPaths()
    return Promise.all(paths.map((path) => summarize(path, todayISO)))
  }, [todayISO])
}

/** One plan's summary, or `null` once loaded if it does not exist. */
export function usePathSummary(pathId: string, todayISO: string): PathSummary | null | undefined {
  return useLiveQuery(async () => {
    const path = await getPath(pathId)
    return path ? summarize(path, todayISO) : null
  }, [pathId, todayISO])
}

/** One week of a plan as the editor shows it. */
export interface PlanWeek {
  /** The plan's code before his changes (for "restore"). */
  base: Curriculum
  dates: string[]
  dayTypes: DayType[]
  days: EditableStep[][]
  done: ReadonlySet<string>
}

/** Every step of one plan week, hidden ones included, on its real dates. */
export function usePlanWeek(path: LearningPathRow, week: number): PlanWeek | undefined {
  return useLiveQuery(async () => {
    const base = baseCurriculum(path.curriculum_key, path.total_weeks)
    const dates = planWeekDates(path.start_date, week)
    const [infos, edits, done] = await Promise.all([
      daysInfo(dates),
      listItemEdits(path.id),
      checkedKeys(path.id),
    ])
    const dayTypes = infos.map((info) => info.dayType)
    return { base, dates, dayTypes, days: editableWeek(base, edits, week, dayTypes), done }
  }, [path.id, path.curriculum_key, path.total_weeks, path.start_date, week])
}
