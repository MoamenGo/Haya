import { describe, expect, it } from 'vitest'
import { PALETTES } from '@/modules/settings/palettes'
// `?raw` is Vite's way to import a file as plain text.
import palettesCss from '@/styles/palettes.css?raw'
import tokensCss from '@/styles/tokens.css?raw'

/**
 * Every palette must stay readable: WCAG AA asks for 4.5:1 between text and
 * its background. The colours live in CSS, so this test reads the CSS files.
 */
const css = `${tokensCss}\n${palettesCss}`.replace(/\/\*[\s\S]*?\*\//g, '')

const AA = 4.5

/** The `--name: #hex` pairs of the block whose selector list contains `selector`. */
function tokens(selector: string): Record<string, string> {
  const block = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].find(([, selectors = '']) =>
    selectors.split(',').some((s) => s.trim() === selector),
  )
  if (!block?.[2]) throw new Error(`No CSS block for ${selector}`)
  return Object.fromEntries(
    [...block[2].matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, hex]) => [name, hex]),
  )
}

function luminance(hex: string): number {
  const channel = (start: number) => {
    const c = parseInt(hex.slice(start, start + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

function contrast(a: string, b: string): number {
  const light = Math.max(luminance(a), luminance(b))
  const dark = Math.min(luminance(a), luminance(b))
  return (light + 0.05) / (dark + 0.05)
}

const TEXT_PAIRS = [
  ['foreground', 'background'],
  ['foreground', 'surface'],
  ['muted', 'surface'],
  ['muted', 'background'],
  ['primary-foreground', 'primary'],
  ['primary-foreground', 'primary-strong'],
  ['primary', 'surface'],
  ['accent-foreground', 'accent'],
] as const

describe.each(PALETTES)('palette %s', (palette) => {
  it.each([
    ['light', `[data-palette='${palette}']`],
    ['dark', `[data-palette='${palette}'].dark`],
  ])('%s mode is readable (WCAG AA)', (_mode, selector) => {
    const colours = tokens(selector)
    for (const [text, background] of TEXT_PAIRS) {
      const fg = colours[text] ?? ''
      const bg = colours[background] ?? ''
      expect(fg, `--${text}`).not.toBe('')
      expect(bg, `--${background}`).not.toBe('')
      expect(contrast(fg, bg), `${text} on ${background}`).toBeGreaterThanOrEqual(AA)
    }
  })
})
