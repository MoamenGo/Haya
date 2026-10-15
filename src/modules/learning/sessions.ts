import type { LearningPathRow } from '@/core/db/types'
import type { Curriculum } from '@/core/learning/types'
import { curriculumFor, studyDay, type StudyDay } from '@/core/learning/plan'
import { weekDaysISO, weekStartISO } from '@/core/time/date'
import { daysInfo } from '@/modules/days/repo'
import { checkedKeys, listActivePaths, listItemEdits } from './repo'

/** One active plan's session on one date. */
export interface PathSession {
  path: LearningPathRow
  /** The plan with the owner's own steps and edits. */
  curriculum: Curriculum
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
  const curriculumByPath = new Map(
    await Promise.all(
      paths.map(async (p) => [p.id, curriculumFor(p, await listItemEdits(p.id))] as const),
    ),
  )

  const byDate = new Map<string, PathSession[]>()
  for (const date of dates) {
    const sessions = paths.flatMap((path) => {
      const done = doneByPath.get(path.id) ?? new Set<string>()
      const curriculum = curriculumByPath.get(path.id)
      if (!curriculum) return []
      const day = studyDay(
        curriculum,
        path.start_date,
        date,
        dayTypes,
        done,
        minimumDates.has(date),
      )
      return day.items.length ? [{ path, curriculum, day, done }] : []
    })
    byDate.set(date, sessions)
  }
  return byDate
}

/** Minutes of study still open on a date, across all plans. */
export function remainingStudyMinutes(sessions: readonly PathSession[]): number {
  return sessions.reduce((sum, s) => sum + s.day.remainingMinutes, 0)
}
