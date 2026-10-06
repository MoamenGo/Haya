import { describe, expect, it } from 'vitest'
import { defaultDayType, weekdayIn } from '@/core/time/dayType'

describe('defaultDayType', () => {
  it.each([
    ['2026-10-03T08:00:00Z', 'hospital'], // Saturday
    ['2026-10-04T08:00:00Z', 'hospital'], // Sunday
    ['2026-10-05T08:00:00Z', 'deep_work'], // Monday
    ['2026-10-06T08:00:00Z', 'deep_work'], // Tuesday
    ['2026-10-07T08:00:00Z', 'hospital'], // Wednesday
    ['2026-10-08T08:00:00Z', 'deep_work'], // Thursday
    ['2026-10-09T08:00:00Z', 'rest'], // Friday
  ])('%s is a %s day', (iso, expected) => {
    expect(defaultDayType(new Date(iso))).toBe(expected)
  })

  it('uses Cairo time, not UTC, near midnight', () => {
    // 22:30 UTC on Thursday is already Friday 01:30 in Cairo (UTC+3 in summer time).
    const lateThursdayUtc = new Date('2026-10-08T22:30:00Z')
    expect(weekdayIn(lateThursdayUtc, 'UTC')).toBe(4)
    expect(weekdayIn(lateThursdayUtc)).toBe(5)
    expect(defaultDayType(lateThursdayUtc)).toBe('rest')
  })
})
