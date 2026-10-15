import type { LearningPathRow } from '@/core/db/types'
import { CURRICULA, studyDay, type StudyDay } from '@/core/learning/plan'
import { weekDaysISO, weekStartISO } from '@/core/time/date'
import { daysInfo } from '@/modules/days/repo'
import { checkedKeys, listActivePaths } from './repo'

/** One active plan's session on one date. */
export interface PathSession {
  path: LearningPathRow
  day: StudyDay
  done: ReadonlySet<string>
}

/**
 * Study sessions of every active plan for the dates of one app week (Saturday
 * to Friday), keyed by date. Day types (with overrides) shape each session.
 */
export async function studyWeek(
  anyDateInWeek: string,
  minimumDates: ReadonlySet<string> = new Set(),
): Promise<Map<string, PathSession[]>> {
  const dates = weekDaysISO(weekStartISO(anyDateInWeek))
  const [paths, infos] = await Promise.all([listActivePaths(), daysInfo(dates)])
  const dayTypes = infos.map((info) => info.dayType)
  const doneByPath = new Map(
    await Promise.all(paths.map(async (p) => [p.id, await checkedKeys(p.id)] as const)),
  )

  const byDate = new Map<string, PathSession[]>()
  for (const date of dates) {
    const sessions = paths.flatMap((path) => {
      const done = doneByPath.get(path.id) ?? new Set<string>()
      const day = studyDay(
        CURRICULA[path.curriculum_key],
        path.start_date,
        date,
        dayTypes,
        done,
        minimumDates.has(date),
      )
      return day.items.length ? [{ path, day, done }] : []
    })
    byDate.set(date, sessions)
  }
  return byDate
}

/** Minutes of study still open on a date, across all plans. */
export function remainingStudyMinutes(sessions: readonly PathSession[]): number {
  return sessions.reduce((sum, s) => sum + s.day.remainingMinutes, 0)
}
