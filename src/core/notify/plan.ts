import { PRAYER_NAMES, type DayPrayers } from '@/core/time/prayers'
import {
  DUE_AFTER_MORNING_MIN,
  EVENING_AFTER_MAGHRIB_MIN,
  MAX_TITLES_IN_BODY,
  MORNING_AFTER_FAJR_MIN,
  QUIET_AFTER_ISHA_MIN,
  type NotifyCategory,
} from './config'

const MINUTE_MS = 60_000

export type NotifyPrefs = Record<NotifyCategory, boolean>

/** What the planner needs to know about one day. */
export interface NotifyDay {
  date: string
  prayers: DayPrayers
  /** Tasks scheduled for the day and not done yet. */
  openTasks: number
  /** Titles of the day's open Big Rocks. */
  bigRocks: string[]
  /** Study minutes still to do that day, across active plans. */
  studyMinutes: number
  /** Titles of open tasks and projects whose deadline is that day. */
  due: string[]
}

/** One notification for the phone to show at a given moment. */
export interface PlannedNotification {
  /** Stable for the same kind, date and slot, so re-sending replaces instead of duplicating. */
  id: string
  /** When to show it, in milliseconds since 1970 (UTC). */
  at: number
  category: NotifyCategory
  title: string
  body: string
  /** The screen it opens. */
  path: string
}

/** i18next's `t`, kept loose so this file doesn't depend on React or i18next. */
export type Translate = (key: string, options?: Record<string, unknown>) => string

/**
 * Turns the coming days into the list of notifications the phone should show.
 * Pure: the same days, settings and time always give the same list.
 * Nothing in the past is returned, and nothing but prayer times falls in the
 * quiet hours (after Isha until Fajr).
 */
export function planNotifications(
  days: readonly NotifyDay[],
  prefs: NotifyPrefs,
  now: Date,
  t: Translate,
): PlannedNotification[] {
  const planned: PlannedNotification[] = []
  for (const day of days) {
    const add = (n: Omit<PlannedNotification, 'id'>, slot: string) => {
      const quiet = n.category !== 'prayers' && isQuiet(n.at, day.prayers)
      if (n.at > now.getTime() && !quiet)
        planned.push({ ...n, id: `${n.category}-${day.date}-${slot}` })
    }
    const morningAt = day.prayers.fajr.getTime() + MORNING_AFTER_FAJR_MIN * MINUTE_MS

    if (prefs.prayers) {
      for (const name of PRAYER_NAMES) {
        add(
          {
            at: day.prayers[name].getTime(),
            category: 'prayers',
            title: t('notify.prayer.title', { prayer: t(`prayers.${name}`) }),
            body: t('notify.prayer.body'),
            path: '/today',
          },
          name,
        )
      }
    }

    if (prefs.morning) {
      const body = morningBody(day, t)
      if (body) {
        add(
          {
            at: morningAt,
            category: 'morning',
            title: t('notify.morning.title'),
            body,
            path: '/today',
          },
          'brief',
        )
      }
    }

    if (prefs.due && day.due.length > 0) {
      add(
        {
          at: morningAt + DUE_AFTER_MORNING_MIN * MINUTE_MS,
          category: 'due',
          title: t('notify.due.title', { count: day.due.length }),
          body: titleList(day.due, t),
          path: '/tasks',
        },
        'deadlines',
      )
    }

    if (prefs.evening) {
      add(
        {
          at: day.prayers.maghrib.getTime() + EVENING_AFTER_MAGHRIB_MIN * MINUTE_MS,
          category: 'evening',
          title: t('notify.evening.title'),
          body: t('notify.evening.body'),
          path: '/today/review',
        },
        'review',
      )
    }
  }
  return planned.sort((a, b) => a.at - b.at)
}

/** Quiet from Isha + the grace period until Fajr of the same date. */
function isQuiet(at: number, prayers: DayPrayers): boolean {
  return (
    at < prayers.fajr.getTime() || at >= prayers.isha.getTime() + QUIET_AFTER_ISHA_MIN * MINUTE_MS
  )
}

/** "3 tasks · most important: A, B · 45 min of study", or '' when the day is empty. */
function morningBody(day: NotifyDay, t: Translate): string {
  const parts: string[] = []
  if (day.openTasks > 0) parts.push(t('notify.morning.tasks', { count: day.openTasks }))
  if (day.bigRocks.length > 0)
    parts.push(t('notify.morning.bigRocks', { titles: titleList(day.bigRocks, t) }))
  if (day.studyMinutes > 0) parts.push(t('notify.morning.study', { count: day.studyMinutes }))
  return parts.join(' · ')
}

/** "A، B، C +2" */
function titleList(titles: readonly string[], t: Translate): string {
  const shown = titles.slice(0, MAX_TITLES_IN_BODY).join(t('notify.separator'))
  const rest = titles.length - MAX_TITLES_IN_BODY
  return rest > 0 ? `${shown} ${t('notify.more', { count: rest })}` : shown
}
