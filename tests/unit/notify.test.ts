import { describe, expect, it } from 'vitest'
import { nativeNotifications } from '@/core/notify/bridge'
import { planNotifications, type NotifyDay, type NotifyPrefs } from '@/core/notify/plan'
import { prayersForDate } from '@/core/time/prayers'

const CAIRO = { latitude: 30.0444, longitude: 31.2357 }
const ALL: NotifyPrefs = { morning: true, evening: true, prayers: true, due: true }
const NONE: NotifyPrefs = { morning: false, evening: false, prayers: false, due: false }
/** Shows the key and its options, so tests can check what was asked for. */
const t = (key: string, options?: Record<string, unknown>) =>
  options ? `${key}${JSON.stringify(options)}` : key

function day(date: string, extra: Partial<NotifyDay> = {}): NotifyDay {
  return {
    date,
    prayers: prayersForDate(date, CAIRO),
    openTasks: 0,
    bigRocks: [],
    studyMinutes: 0,
    due: [],
    ...extra,
  }
}

const BEFORE_DAWN = new Date('2026-10-21T00:30:00Z') // 03:30 in Cairo

describe('planNotifications', () => {
  it('sends nothing when every kind is off', () => {
    expect(planNotifications([day('2026-10-21', { openTasks: 3 })], NONE, BEFORE_DAWN, t)).toEqual(
      [],
    )
  })

  it('gives the five prayers, in order, with stable ids', () => {
    const list = planNotifications([day('2026-10-21')], { ...NONE, prayers: true }, BEFORE_DAWN, t)
    expect(list.map((n) => n.id)).toEqual([
      'prayers-2026-10-21-fajr',
      'prayers-2026-10-21-dhuhr',
      'prayers-2026-10-21-asr',
      'prayers-2026-10-21-maghrib',
      'prayers-2026-10-21-isha',
    ])
    expect(list[0]?.title).toContain('prayers.fajr')
  })

  it('skips the morning brief on an empty day, and sends it 20 min after Fajr otherwise', () => {
    const prefs = { ...NONE, morning: true }
    expect(planNotifications([day('2026-10-21')], prefs, BEFORE_DAWN, t)).toEqual([])

    const busy = day('2026-10-21', { openTasks: 4, bigRocks: ['A', 'B'], studyMinutes: 45 })
    const [brief] = planNotifications([busy], prefs, BEFORE_DAWN, t)
    expect(brief?.at).toBe(busy.prayers.fajr.getTime() + 20 * 60_000)
    expect(brief?.body).toContain('notify.morning.tasks{"count":4}')
    expect(brief?.body).toContain('A')
    expect(brief?.body).toContain('notify.morning.study{"count":45}')
    expect(brief?.path).toBe('/today')
  })

  it('names at most three deadlines and counts the rest', () => {
    const due = day('2026-10-21', { due: ['A', 'B', 'C', 'D', 'E'] })
    const [n] = planNotifications([due], { ...NONE, due: true }, BEFORE_DAWN, t)
    expect(n?.title).toBe('notify.due.title{"count":5}')
    expect(n?.body).toBe('Anotify.separatorBnotify.separatorC notify.more{"count":2}')
    expect(n?.path).toBe('/tasks')
  })

  it('puts the evening review after Maghrib and opens the review', () => {
    const d = day('2026-10-21')
    const [n] = planNotifications([d], { ...NONE, evening: true }, BEFORE_DAWN, t)
    expect(n?.at).toBe(d.prayers.maghrib.getTime() + 30 * 60_000)
    expect(n?.path).toBe('/today/review')
  })

  it('drops what already passed', () => {
    const d = day('2026-10-21', { openTasks: 2 })
    const afternoon = new Date(d.prayers.asr.getTime() + 60_000)
    const list = planNotifications([d], ALL, afternoon, t)
    expect(list.map((n) => n.category)).toEqual(['prayers', 'evening', 'prayers'])
  })

  it('covers several days, sorted by time', () => {
    const list = planNotifications(
      [day('2026-10-21', { openTasks: 1 }), day('2026-10-22', { openTasks: 1 })],
      ALL,
      BEFORE_DAWN,
      t,
    )
    expect(list).toHaveLength(2 * (5 + 2))
    expect(list.every((n, i) => i === 0 || list[i - 1]!.at <= n.at)).toBe(true)
  })
})

describe('nativeNotifications', () => {
  it('is null in a normal browser and sends JSON inside the Android app', () => {
    expect(nativeNotifications()).toBeNull()
    const sent: string[] = []
    window.AndroidBridge = { scheduleNotifications: (json) => sent.push(json) }
    nativeNotifications()?.([])
    expect(sent).toEqual(['[]'])
    delete window.AndroidBridge
  })
})
