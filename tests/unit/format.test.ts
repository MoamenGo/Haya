import { describe, expect, it } from 'vitest'
import { formatGregorian, formatHijri } from '@/core/time/format'

const date = new Date('2026-10-06T08:00:00Z')

describe('date formatting', () => {
  it('shows Hijri dates with Western digits in Arabic', () => {
    expect(formatHijri(date, 'ar')).toContain('1448')
    expect(formatHijri(date, 'ar')).toContain('ربيع الآخر')
  })

  it('shows the Arabic weekday for Gregorian dates', () => {
    expect(formatGregorian(date, 'ar')).toContain('الثلاثاء')
    expect(formatGregorian(date, 'ar')).toContain('2026')
  })

  it('formats in English too', () => {
    expect(formatGregorian(date, 'en')).toContain('Tuesday')
    expect(formatHijri(date, 'en')).toContain('1448')
  })
})
