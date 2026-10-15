import {
  DEFAULT_DAY_TYPE_BY_WEEKDAY,
  WEEK_STARTS_ON,
  type DayType,
  type Weekday,
} from '@/core/time/config'
import { DAYS_PER_WEEK } from '@/core/time/date'
import { english } from './curricula/english'
import { healthTech } from './curricula/healthTech'
import type { Curriculum, CurriculumKey, StudyItem } from './types'
import { dayIndexInWeek, planWeekOn } from './week'

export const CURRICULA: Readonly<Record<CurriculumKey, Curriculum>> = {
  english_a2_c1: english,
  health_tech: healthTech,
}

export type StudyDayState = 'not_started' | 'studying' | 'finished'

export interface StudyDay {
  state: StudyDayState
  /** Plan week on this date (0 before the start). */
  week: number
  items: StudyItem[]
  /** Minutes of items not yet ticked: what still counts against today's capacity. */
  remainingMinutes: number
}

/**
 * One plan's session for one date.
 * `weekDayTypes` are the day types of that date's week, Saturday first, with
 * overrides applied: the whole week is needed because a block skipped by one
 * day (say, an exam) moves to another.
 */
export function studyDay(
  curriculum: Curriculum,
  startISO: string,
  dateISO: string,
  weekDayTypes: readonly DayType[],
  done: ReadonlySet<string>,
  minimumMode: boolean,
): StudyDay {
  const week = planWeekOn(startISO, dateISO)
  if (week === 0) return { state: 'not_started', week, items: [], remainingMinutes: 0 }
  if (week > curriculum.totalWeeks) {
    return { state: 'finished', week, items: [], remainingMinutes: 0 }
  }
  const day = dayIndexInWeek(dateISO)
  const items = minimumMode
    ? [curriculum.minimum(week, day)]
    : (curriculum.planWeek(week, weekDayTypes)[day] ?? [])
  const remainingMinutes = items
    .filter((item) => !done.has(item.key))
    .reduce((sum, item) => sum + item.minutes, 0)
  return { state: 'studying', week, items, remainingMinutes }
}

/**
 * Ticked share of the whole plan (0–1), counted on the usual week pattern.
 * A calm overview number, not a score: weeks with changed days may differ a little.
 */
export function planProgress(
  curriculum: Curriculum,
  defaultWeek: readonly DayType[],
  done: ReadonlySet<string>,
): number {
  let total = 0
  let ticked = 0
  for (let w = 1; w <= curriculum.totalWeeks; w++) {
    for (const item of curriculum.planWeek(w, defaultWeek).flat()) {
      total += 1
      if (done.has(item.key)) ticked += 1
    }
  }
  return total === 0 ? 0 : ticked / total
}

/**
 * The usual day types of a week, Saturday first, from the defaults
 * (CLAUDE.md §2). Used where no real dates are involved, such as overall progress.
 */
export function defaultWeekDayTypes(): DayType[] {
  return Array.from({ length: DAYS_PER_WEEK }, (_, i) => {
    const weekday = ((WEEK_STARTS_ON + i) % DAYS_PER_WEEK) as Weekday
    return DEFAULT_DAY_TYPE_BY_WEEKDAY[weekday]
  })
}
