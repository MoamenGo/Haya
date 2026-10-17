import { describe, expect, it } from 'vitest'
import { resolveTheme } from '@/app/appearance'

describe('resolveTheme', () => {
  it('light and dark ignore the device', () => {
    expect(resolveTheme('light', true)).toEqual({ dark: false, glass: false })
    expect(resolveTheme('dark', false)).toEqual({ dark: true, glass: false })
  })

  it('system follows the device', () => {
    expect(resolveTheme('system', false)).toEqual({ dark: false, glass: false })
    expect(resolveTheme('system', true)).toEqual({ dark: true, glass: false })
  })

  it('glass is a look that follows the device for light or dark', () => {
    expect(resolveTheme('glass', false)).toEqual({ dark: false, glass: true })
    expect(resolveTheme('glass', true)).toEqual({ dark: true, glass: true })
  })
})
