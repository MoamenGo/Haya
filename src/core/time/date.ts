import { DEFAULT_TIMEZONE } from './config'

const MS_PER_DAY = 24 * 60 * 60 * 1000

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
