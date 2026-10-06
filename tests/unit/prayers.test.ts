import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCATION } from '@/core/time/config'
import { currentBlock, formatTime, nextPrayer, prayersForDate } from '@/core/time/prayers'

const cairoClock = (d: Date) => formatTime(d, 'en')

describe('prayer times (Cairo, Egyptian method)', () => {
  const prayers = prayersForDate('2026-10-06', DEFAULT_LOCATION)

  it('computes the five prayers in order', () => {
    const order = [
      prayers.fajr,
      prayers.sunrise,
      prayers.dhuhr,
      prayers.asr,
      prayers.maghrib,
      prayers.isha,
    ]
    expect(order.every((t, i) => i === 0 || t > order[i - 1]!)).toBe(true)
    // Sanity range for early October in Cairo, within a few minutes of published tables.
    expect(cairoClock(prayers.fajr)).toMatch(/^0?5:[12]\d$/)
    expect(cairoClock(prayers.dhuhr)).toMatch(/^12:4\d$/)
  })

  it('finds the next prayer during the day', () => {
    const afterDhuhr = new Date(prayers.dhuhr.getTime() + 60_000)
    expect(nextPrayer(afterDhuhr, DEFAULT_LOCATION).name).toBe('asr')
  })

  it("gives tomorrow's Fajr after Isha", () => {
    const lateNight = new Date(prayers.isha.getTime() + 60_000)
    const next = nextPrayer(lateNight, DEFAULT_LOCATION)
    expect(next.name).toBe('fajr')
    expect(next.at > lateNight).toBe(true)
  })

  it('maps a time to its prayer block', () => {
    const at = (d: Date, minutes: number) => new Date(d.getTime() + minutes * 60_000)
    expect(currentBlock(at(prayers.fajr, -10), prayers)).toBe('after_isha')
    expect(currentBlock(at(prayers.fajr, 10), prayers)).toBe('after_fajr')
    expect(currentBlock(at(prayers.sunrise, 60), prayers)).toBe('duha')
    expect(currentBlock(at(prayers.dhuhr, 10), prayers)).toBe('after_dhuhr')
    expect(currentBlock(at(prayers.asr, 10), prayers)).toBe('after_asr')
    expect(currentBlock(at(prayers.maghrib, 10), prayers)).toBe('maghrib_isha')
    expect(currentBlock(at(prayers.isha, 10), prayers)).toBe('after_isha')
  })
})
