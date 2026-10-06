import { describe, expect, it } from 'vitest'
import { parseCapture, titleFromCapture } from '@/core/capture/parse'

describe('parseCapture', () => {
  it('keeps the text as typed, trimmed', () => {
    expect(parseCapture('  أذاكر درس 3  ').text).toBe('أذاكر درس 3')
  })

  it('spots links', () => {
    expect(parseCapture('شوف ده https://example.com/a?b=1').kindHint).toBe('link')
    expect(parseCapture('مفيش رابط').kindHint).toBeNull()
  })

  it('marks ! at the start or end as important', () => {
    expect(parseCapture('!أدفع الفاتورة').isImportant).toBe(true)
    expect(parseCapture('أدفع الفاتورة!').isImportant).toBe(true)
    expect(parseCapture('أدفع الفاتورة').isImportant).toBe(false)
  })

  it('collects Arabic and Latin #tags once each', () => {
    expect(parseCapture('فكرة #مشروع و #ai و #مشروع').tags).toEqual(['مشروع', 'ai'])
  })
})

describe('titleFromCapture', () => {
  it('removes ! markers only at the ends', () => {
    expect(titleFromCapture('!!أكلم الدكتور!')).toBe('أكلم الدكتور')
    expect(titleFromCapture('ده مهم! جدا')).toBe('ده مهم! جدا')
  })
})
