import { describe, expect, it } from 'vitest'
import { matchesSearch, normalizeForSearch } from '@/core/search/normalize'

describe('normalizeForSearch', () => {
  it('removes tashkeel and tatweel and unifies letter forms', () => {
    expect(normalizeForSearch('مُذَاكـــرَة')).toBe('مذاكره')
    expect(normalizeForSearch('أحمد إلى آمال')).toBe('احمد الي امال')
  })

  it('lower-cases English and squeezes spaces', () => {
    expect(normalizeForSearch('  Learn   React ')).toBe('learn react')
  })
})

describe('matchesSearch', () => {
  it('finds every word in any order, ignoring spelling variants', () => {
    expect(matchesSearch('أذاكر الدرس الثالث', 'الدرس اذاكر')).toBe(true)
    expect(matchesSearch('مراجعة سورة البقرة', 'مراجعه')).toBe(true)
    expect(matchesSearch('Watch lesson 3', 'LESSON')).toBe(true)
    expect(matchesSearch('مراجعة', 'كتاب')).toBe(false)
  })

  it('matches everything for an empty query', () => {
    expect(matchesSearch('أي حاجة', '  ')).toBe(true)
  })
})
