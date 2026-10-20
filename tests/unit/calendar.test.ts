import { describe, expect, it } from 'vitest'
import {
  addMonthsISO,
  dateSearch,
  daysInMonth,
  isDateISO,
  monthGridISO,
  monthStartISO,
  sameMonth,
} from '@/core/time/calendar'
import { weekdayOfISO } from '@/core/time/date'

const SATURDAY = 6

describe('isDateISO', () => {
  it('accepts real dates only', () => {
    expect(isDateISO('2026-10-20')).toBe(true)
    expect(isDateISO('2028-02-29')).toBe(true)
    expect(isDateISO('2026-02-30')).toBe(false)
    expect(isDateISO('2026-13-01')).toBe(false)
    expect(isDateISO('20-10-2026')).toBe(false)
    expect(isDateISO(undefined)).toBe(false)
  })
})

describe('dateSearch', () => {
  it('keeps a real date and clears anything else', () => {
    expect(dateSearch({ date: '2026-10-23' })).toEqual({ date: '2026-10-23' })
    // The key stays, set to undefined, so it overrides the raw address value.
    expect(dateSearch({ date: '2026-02-30' })).toStrictEqual({ date: undefined })
    expect(dateSearch({ date: 'hello' })).toStrictEqual({ date: undefined })
    expect(dateSearch({})).toStrictEqual({ date: undefined })
  })
})

describe('months', () => {
  it('finds the first of the month and moves across years', () => {
    expect(monthStartISO('2026-10-20')).toBe('2026-10-01')
    expect(addMonthsISO('2026-10-01', 1)).toBe('2026-11-01')
    expect(addMonthsISO('2026-12-01', 1)).toBe('2027-01-01')
    expect(addMonthsISO('2026-01-01', -1)).toBe('2025-12-01')
    expect(addMonthsISO('2026-10-01', -14)).toBe('2025-08-01')
    expect(sameMonth('2026-10-01', '2026-10-31')).toBe(true)
    expect(sameMonth('2026-10-31', '2026-11-01')).toBe(false)
  })

  it('counts the days of a month, leap years included', () => {
    expect(daysInMonth('2026-10-20')).toBe(31)
    expect(daysInMonth('2026-11-01')).toBe(30)
    expect(daysInMonth('2027-02-01')).toBe(28)
    expect(daysInMonth('2028-02-14')).toBe(29)
  })
})

describe('monthGridISO', () => {
  it('lays October 2026 out in Saturday-to-Friday weeks', () => {
    const weeks = monthGridISO('2026-10-20')
    // 1 Oct 2026 is a Thursday, so the first row starts on Saturday 26 Sep.
    expect(weeks[0]?.[0]).toBe('2026-09-26')
    expect(weeks.at(-1)?.at(-1)).toBe('2026-11-06')
    expect(weeks).toHaveLength(6)
    for (const week of weeks) {
      expect(week).toHaveLength(7)
      expect(weekdayOfISO(week[0]!)).toBe(SATURDAY)
    }
  })

  it('holds every day of the month exactly once', () => {
    const days = monthGridISO('2027-02-10')
      .flat()
      .filter((d) => d.startsWith('2027-02'))
    expect(days).toHaveLength(28)
    expect(new Set(days).size).toBe(28)
  })

  it('needs only four rows when a month fits exactly', () => {
    // February 2025 starts on a Saturday and has 28 days.
    expect(monthGridISO('2025-02-01')).toHaveLength(4)
  })
})
