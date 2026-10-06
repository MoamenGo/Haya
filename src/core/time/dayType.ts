import { DEFAULT_DAY_TYPE_BY_WEEKDAY, DEFAULT_TIMEZONE, type DayType, type Weekday } from './config'

const WEEKDAY_INDEX: Record<string, Weekday> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

/**
 * The weekday of `date` in the owner's timezone (not the device's), so the
 * day type stays right even if the phone's clock zone is wrong or travelling.
 */
export function weekdayIn(date: Date, timeZone: string = DEFAULT_TIMEZONE): Weekday {
  const short = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone }).format(date)
  const weekday = WEEKDAY_INDEX[short]
  if (weekday === undefined) throw new Error(`Unexpected weekday: ${short}`)
  return weekday
}

/** Day type from the weekly pattern. Per-date overrides arrive in Phase 1. */
export function defaultDayType(
  date: Date,
  pattern: Readonly<Record<Weekday, DayType>> = DEFAULT_DAY_TYPE_BY_WEEKDAY,
  timeZone: string = DEFAULT_TIMEZONE,
): DayType {
  return pattern[weekdayIn(date, timeZone)]
}
