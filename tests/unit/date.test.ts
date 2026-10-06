import { describe, expect, it } from 'vitest'
import { addDaysISO, lastDaysISO, localDateISO } from '@/core/time/date'

describe('local dates', () => {
  it('uses the Cairo date, not the UTC date', () => {
    // 23:30 UTC on Oct 6 is already Oct 7 in Cairo.
    expect(localDateISO(new Date('2026-10-06T23:30:00Z'))).toBe('2026-10-07')
    expect(localDateISO(new Date('2026-10-06T23:30:00Z'), 'UTC')).toBe('2026-10-06')
  })

  it('adds days across month and year ends', () => {
    expect(addDaysISO('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDaysISO('2027-01-01', -1)).toBe('2026-12-31')
  })

  it('lists the last N days, oldest first', () => {
    expect(lastDaysISO('2026-10-06', 3)).toEqual(['2026-10-04', '2026-10-05', '2026-10-06'])
  })
})
