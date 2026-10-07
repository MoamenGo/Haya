import { describe, expect, it } from 'vitest'
import type { DayPrayers } from '@/core/time/prayers'
import { prayerTrack, skyPhase } from '@/core/time/sky'

const at = (h: number, m = 0) => new Date(2026, 9, 7, h, m)
const prayers: DayPrayers = {
  fajr: at(4, 30),
  sunrise: at(6),
  dhuhr: at(12),
  asr: at(15, 30),
  maghrib: at(18),
  isha: at(19, 30),
}

describe('skyPhase', () => {
  it('follows the prayers through the day', () => {
    expect(skyPhase(at(2), prayers)).toBe('night')
    expect(skyPhase(at(5), prayers)).toBe('dawn')
    expect(skyPhase(at(9), prayers)).toBe('morning')
    expect(skyPhase(at(13), prayers)).toBe('noon')
    expect(skyPhase(at(16), prayers)).toBe('afternoon')
    expect(skyPhase(at(18, 30), prayers)).toBe('sunset')
    expect(skyPhase(at(22), prayers)).toBe('night')
  })
})

describe('prayerTrack', () => {
  it('is empty before Fajr and full after Isha', () => {
    expect(prayerTrack(at(3), prayers)).toEqual({ passed: new Set(), progress: 0 })
    expect(prayerTrack(at(23), prayers).progress).toBe(1)
    expect(prayerTrack(at(23), prayers).passed.size).toBe(5)
  })

  it('moves evenly between two prayers', () => {
    // Halfway between Fajr (4:30) and Dhuhr (12:00) is 8:15: half of the first of 4 gaps.
    const track = prayerTrack(at(8, 15), prayers)
    expect(track.progress).toBeCloseTo(0.125)
    expect([...track.passed]).toEqual(['fajr'])
  })
})
