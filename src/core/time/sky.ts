import { PRAYER_NAMES, type DayPrayers, type PrayerName } from './prayers'

/** The part of the day between two prayers; the Today screen colours itself by it. */
export type SkyPhase = 'night' | 'dawn' | 'morning' | 'noon' | 'afternoon' | 'sunset'

export function skyPhase(now: Date, prayers: DayPrayers): SkyPhase {
  if (now < prayers.fajr) return 'night'
  if (now < prayers.sunrise) return 'dawn'
  if (now < prayers.dhuhr) return 'morning'
  if (now < prayers.asr) return 'noon'
  if (now < prayers.maghrib) return 'afternoon'
  if (now < prayers.isha) return 'sunset'
  return 'night'
}

/**
 * How far below the horizon Fajr and Isha sit on the sun's path, as a share
 * of the daylight arc. The sun is under the horizon then, so their exact
 * place is a drawing choice, not astronomy.
 */
export const TWILIGHT_SHARE = 0.08

export interface SunPath {
  /** Prayers whose time has passed today. */
  passed: ReadonlySet<PrayerName>
  /**
   * Where each prayer sits on the sun's path: 0 is sunrise, 1 is sunset
   * (Maghrib), 0.5 is about Dhuhr. Fajr is a little before 0 and Isha a
   * little after 1, below the horizon.
   */
  positions: Record<PrayerName, number>
  /** Where the sun is now on the same scale, or null at night (after Isha, before Fajr). */
  sun: number | null
}

/** Places the prayers and the sun on the day's arc, from real times. */
export function sunPath(now: Date, prayers: DayPrayers): SunPath {
  const passed = new Set(PRAYER_NAMES.filter((name) => prayers[name] <= now))
  const share = (from: Date, to: Date, at: Date) =>
    (at.getTime() - from.getTime()) / (to.getTime() - from.getTime())
  const daylight = (at: Date) => share(prayers.sunrise, prayers.maghrib, at)

  const positions: Record<PrayerName, number> = {
    fajr: -TWILIGHT_SHARE,
    dhuhr: daylight(prayers.dhuhr),
    asr: daylight(prayers.asr),
    maghrib: 1,
    isha: 1 + TWILIGHT_SHARE,
  }

  let sun: number | null
  if (now < prayers.fajr || now >= prayers.isha) sun = null
  else if (now < prayers.sunrise)
    sun = -TWILIGHT_SHARE + TWILIGHT_SHARE * share(prayers.fajr, prayers.sunrise, now)
  else if (now < prayers.maghrib) sun = daylight(now)
  else sun = 1 + TWILIGHT_SHARE * share(prayers.maghrib, prayers.isha, now)

  return { passed, positions, sun }
}
