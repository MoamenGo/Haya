import { DAYS_PER_WEEK, addDaysISO, weekStartISO } from '@/core/time/date'

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Whole days from `fromISO` to `toISO` (negative if `toISO` is earlier). */
function daysBetween(fromISO: string, toISO: string): number {
  return Math.round(
    (Date.parse(`${toISO}T00:00:00Z`) - Date.parse(`${fromISO}T00:00:00Z`)) / MS_PER_DAY,
  )
}

/**
 * A plan's weeks follow the app's weeks (Saturday to Friday), so a start date
 * in the middle of a week counts from that week's Saturday.
 */
export function planStartISO(startISO: string): string {
  return weekStartISO(startISO)
}

/** Week 1, 2, … of a plan on `dateISO`. 0 means the plan has not started yet. */
export function planWeekOn(startISO: string, dateISO: string): number {
  const days = daysBetween(planStartISO(startISO), dateISO)
  if (days < 0) return 0
  return Math.floor(days / DAYS_PER_WEEK) + 1
}

/** The seven dates (Saturday first) of a plan's week. */
export function planWeekDates(startISO: string, week: number): string[] {
  const first = addDaysISO(planStartISO(startISO), (week - 1) * DAYS_PER_WEEK)
  return Array.from({ length: DAYS_PER_WEEK }, (_, i) => addDaysISO(first, i))
}

/** Position of a date inside its week: 0 = Saturday … 6 = Friday. */
export function dayIndexInWeek(dateISO: string): number {
  return daysBetween(weekStartISO(dateISO), dateISO)
}
