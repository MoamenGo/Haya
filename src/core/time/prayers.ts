import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan'
import type { PrayerBlock } from '@/core/db/types'
import { DEFAULT_TIMEZONE } from './config'
import { addDaysISO, localDateISO } from './date'

export const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
export type PrayerName = (typeof PRAYER_NAMES)[number]

export interface Location {
  latitude: number
  longitude: number
}

export interface DayPrayers {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

/**
 * Prayer times for a calendar day, computed on the device with the
 * Egyptian General Authority of Survey method (no network needed).
 */
export function prayersForDate(dateISO: string, location: Location): DayPrayers {
  const [y, m, d] = dateISO.split('-').map(Number) as [number, number, number]
  // adhan reads only the year/month/day of this Date, so a local midnight is fine.
  const times = new PrayerTimes(
    new Coordinates(location.latitude, location.longitude),
    new Date(y, m - 1, d),
    CalculationMethod.Egyptian(),
  )
  const { fajr, sunrise, dhuhr, asr, maghrib, isha } = times
  return { fajr, sunrise, dhuhr, asr, maghrib, isha }
}

export interface NextPrayer {
  name: PrayerName
  at: Date
}

/** The next of the five prayers after `now` (tomorrow's Fajr after Isha). */
export function nextPrayer(
  now: Date,
  location: Location,
  timeZone: string = DEFAULT_TIMEZONE,
): NextPrayer {
  const today = localDateISO(now, timeZone)
  const prayers = prayersForDate(today, location)
  const upcoming = PRAYER_NAMES.find((name) => prayers[name] > now)
  if (upcoming) return { name: upcoming, at: prayers[upcoming] }
  return { name: 'fajr', at: prayersForDate(addDaysISO(today, 1), location).fajr }
}

/** Which prayer-anchored block `now` falls in. Before Fajr counts as after Isha. */
export function currentBlock(now: Date, prayers: DayPrayers): PrayerBlock {
  if (now < prayers.fajr) return 'after_isha'
  if (now < prayers.sunrise) return 'after_fajr'
  if (now < prayers.dhuhr) return 'duha'
  if (now < prayers.asr) return 'after_dhuhr'
  if (now < prayers.maghrib) return 'after_asr'
  if (now < prayers.isha) return 'maghrib_isha'
  return 'after_isha'
}

export function formatTime(instant: Date, lang: 'ar' | 'en', timeZone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(instant)
}
