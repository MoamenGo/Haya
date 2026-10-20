import { WEEK_STARTS_ON, type Weekday } from './config'
import { addDaysISO, DAYS_PER_WEEK, weekStartISO } from './date'

/**
 * Month grids for the calendar screen. Everything works on `YYYY-MM-DD`
 * strings (calendar math, no timezone), like the rest of src/core/time.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const MONTHS_PER_YEAR = 12

/** True for a real calendar date written as `YYYY-MM-DD` (rejects 2026-02-30). */
export function isDateISO(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false
  // Round-trip through addDaysISO: an impossible date comes back different.
  return addDaysISO(value, 0) === value
}

/**
 * Reads `?date=YYYY-MM-DD` from an address (Today's arrows, the calendar).
 * Anything that is not a real date becomes `undefined`, so a broken link just
 * shows today. The router merges this result over the raw address params, so
 * the key must be set to `undefined` explicitly: leaving it out would keep the
 * bad value and crash the page.
 */
export function dateSearch(search: Record<string, unknown>): { date?: string | undefined } {
  return { date: isDateISO(search.date) ? search.date : undefined }
}

/** The first day of the month that contains `dateISO`. */
export function monthStartISO(dateISO: string): string {
  return `${dateISO.slice(0, 7)}-01`
}

/** The first day of the month `months` away (negative goes back). */
export function addMonthsISO(monthISO: string, months: number): string {
  const [y, m] = monthISO.split('-').map(Number) as [number, number]
  const index = y * MONTHS_PER_YEAR + (m - 1) + months
  const year = Math.floor(index / MONTHS_PER_YEAR)
  const month = (index % MONTHS_PER_YEAR) + 1
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`
}

/** How many days the month holding `dateISO` has (28–31). */
export function daysInMonth(dateISO: string): number {
  const last = addDaysISO(addMonthsISO(monthStartISO(dateISO), 1), -1)
  return Number(last.slice(8))
}

/** True when both dates fall in the same calendar month. */
export function sameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7)
}

/**
 * The weeks to draw for a month: whole weeks (Saturday to Friday by default),
 * from the week holding the 1st to the week holding the last day. Days from
 * the months around it fill the first and last rows, so every row has 7 days.
 */
export function monthGridISO(
  anyDateInMonth: string,
  weekStartsOn: Weekday = WEEK_STARTS_ON,
): string[][] {
  const first = monthStartISO(anyDateInMonth)
  const last = addDaysISO(addMonthsISO(first, 1), -1)
  const weeks: string[][] = []
  for (let start = weekStartISO(first, weekStartsOn); start <= last;) {
    weeks.push(Array.from({ length: DAYS_PER_WEEK }, (_, i) => addDaysISO(start, i)))
    start = addDaysISO(start, DAYS_PER_WEEK)
  }
  return weeks
}
