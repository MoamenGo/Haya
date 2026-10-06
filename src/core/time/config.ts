/** Defaults from CLAUDE.md §2 and §4.2. The owner can change them in Settings (Phase 1). */

export const DAY_TYPES = ['hospital', 'deep_work', 'rest', 'custom'] as const
export type DayType = (typeof DAY_TYPES)[number]

/** JavaScript weekday numbers: 0 = Sunday … 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const DEFAULT_TIMEZONE = 'Africa/Cairo'

/** The week starts on Saturday. */
export const WEEK_STARTS_ON: Weekday = 6

export const DEFAULT_DAY_TYPE_BY_WEEKDAY: Readonly<Record<Weekday, DayType>> = {
  6: 'hospital', // Saturday
  0: 'hospital', // Sunday
  1: 'deep_work', // Monday
  2: 'deep_work', // Tuesday
  3: 'hospital', // Wednesday
  4: 'deep_work', // Thursday
  5: 'rest', // Friday
}

/** Discretionary minutes per day type (§4.2). Planning heuristics, not laws. */
export const DEFAULT_CAPACITY_MIN: Readonly<Record<Exclude<DayType, 'custom'>, number>> = {
  hospital: 120,
  deep_work: 360,
  rest: 60,
}

/** Used until the owner sets a location: central Cairo. */
export const DEFAULT_LOCATION = { latitude: 30.0444, longitude: 31.2357 } as const
