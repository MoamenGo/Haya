import { DEFAULT_TIMEZONE, WEEK_STARTS_ON, type Weekday } from './config'

const MS_PER_DAY = 24 * 60 * 60 * 1000
export const DAYS_PER_WEEK = 7

/**
 * The calendar date (`YYYY-MM-DD`) of an instant in the owner's timezone.
 * Days are stored this way so "today" never shifts with UTC or travel.
 */
export function localDateISO(instant: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  // The `en-CA` locale formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(instant)
}

/** Adds whole days to a `YYYY-MM-DD` string (calendar math, no timezone involved). */
export function addDaysISO(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(y, m - 1, d) + days * MS_PER_DAY).toISOString().slice(0, 10)
}

/** The `count` dates ending with `endISO`, oldest first. */
export function lastDaysISO(endISO: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDaysISO(endISO, i - count + 1))
}

/** JavaScript weekday (0 = Sunday … 6 = Saturday) of a `YYYY-MM-DD` date. */
export function weekdayOfISO(dateISO: string): Weekday {
  const [y, m, d] = dateISO.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() as Weekday
}

/** The first day of the week that contains `dateISO` (Saturday by default). */
export function weekStartISO(dateISO: string, weekStartsOn: Weekday = WEEK_STARTS_ON): string {
  const back = (weekdayOfISO(dateISO) - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK
  return addDaysISO(dateISO, -back)
}

/** The seven dates of the week that starts on `startISO`. */
export function weekDaysISO(startISO: string): string[] {
  return Array.from({ length: DAYS_PER_WEEK }, (_, i) => addDaysISO(startISO, i))
}

/** Noon UTC on a calendar date: a safe instant for formatting that date in Cairo. */
export function instantOfISO(dateISO: string): Date {
  return new Date(`${dateISO}T12:00:00Z`)
}
