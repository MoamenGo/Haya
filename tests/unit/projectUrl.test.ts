import { describe, expect, it } from 'vitest'
import { cleanSetting, projectOrigin } from '@/core/auth/projectUrl'

describe('projectOrigin', () => {
  it('keeps only the origin of a pasted Supabase address', () => {
    expect(projectOrigin('https://abc.supabase.co')).toBe('https://abc.supabase.co')
    expect(projectOrigin('https://abc.supabase.co/')).toBe('https://abc.supabase.co')
    expect(projectOrigin('https://abc.supabase.co/rest/v1/')).toBe('https://abc.supabase.co')
    expect(projectOrigin(' "https://abc.supabase.co/rest/v1" ')).toBe('https://abc.supabase.co')
  })

  it('treats a missing or unreadable value as not set', () => {
    expect(projectOrigin(undefined)).toBeUndefined()
    expect(projectOrigin('  ')).toBeUndefined()
    expect(projectOrigin('abc.supabase.co')).toBeUndefined()
  })
})

describe('cleanSetting', () => {
  it('trims spaces and quotes', () => {
    expect(cleanSetting(" 'key' ")).toBe('key')
    expect(cleanSetting('')).toBeUndefined()
  })
})
