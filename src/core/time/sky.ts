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

export interface PrayerTrack {
  /** Prayers whose time has passed today. */
  passed: ReadonlySet<PrayerName>
  /**
   * How far along the day's track "now" is, from 0 (at Fajr) to 1 (at Isha).
   * Each of the 4 gaps between prayers gets an equal share of the track, so
   * the 5 prayers sit evenly spaced and the marker moves within the current gap.
   */
  progress: number
}

export function prayerTrack(now: Date, prayers: DayPrayers): PrayerTrack {
  const passed = new Set(PRAYER_NAMES.filter((name) => prayers[name] <= now))
  const gaps = PRAYER_NAMES.length - 1
  if (now <= prayers.fajr) return { passed, progress: 0 }
  if (now >= prayers.isha) return { passed, progress: 1 }
  const i = PRAYER_NAMES.findIndex((name) => prayers[name] > now) - 1
  const from = prayers[PRAYER_NAMES[i]!].getTime()
  const to = prayers[PRAYER_NAMES[i + 1]!].getTime()
  const within = (now.getTime() - from) / (to - from)
  return { passed, progress: (i + within) / gaps }
}
