import { describe, expect, it } from 'vitest'
import type { DayPrayers } from '@/core/time/prayers'
import { TWILIGHT_SHARE, skyPhase, sunPath } from '@/core/time/sky'

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

describe('sunPath', () => {
  it('puts Dhuhr near the top of the arc and Maghrib on the horizon', () => {
    const { positions } = sunPath(at(9), prayers)
    // Sunrise 6:00 to Maghrib 18:00: Dhuhr (12:00) is the middle, Asr (15:30) later.
    expect(positions.dhuhr).toBeCloseTo(0.5)
    expect(positions.asr).toBeCloseTo(0.792, 2)
    expect(positions.maghrib).toBe(1)
    expect(positions.fajr).toBe(-TWILIGHT_SHARE)
    expect(positions.isha).toBe(1 + TWILIGHT_SHARE)
  })

  it('has no sun at night and moves it with the clock by day', () => {
    expect(sunPath(at(3), prayers).sun).toBeNull()
    expect(sunPath(at(23), prayers).sun).toBeNull()
    expect(sunPath(at(23), prayers).passed.size).toBe(5)
    expect(sunPath(at(9), prayers).sun).toBeCloseTo(0.25)
    expect([...sunPath(at(9), prayers).passed]).toEqual(['fajr'])
  })

  it('keeps the sun below the horizon between Fajr and sunrise, and after Maghrib', () => {
    expect(sunPath(at(5, 15), prayers).sun).toBeCloseTo(-TWILIGHT_SHARE / 2)
    expect(sunPath(at(18, 45), prayers).sun).toBeCloseTo(1 + TWILIGHT_SHARE / 2)
  })
})
