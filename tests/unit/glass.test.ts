import { describe, expect, it } from 'vitest'
import { PALETTES } from '@/modules/settings/palettes'
import glassCss from '@/styles/glass.css?raw'
import palettesCss from '@/styles/palettes.css?raw'
import tokensCss from '@/styles/tokens.css?raw'

/**
 * The glass look puts see-through cards over a wash of the theme colours, so
 * readability depends on what is behind them. This test rebuilds the worst
 * case for every palette, light and dark: the strongest blob of the wash, and
 * a card on top of it. Text must still reach WCAG AA (4.5:1) there.
 * The numbers come from src/styles/glass.css, so tuning the look re-runs this.
 */
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const paletteCss = strip(`${tokensCss}\n${palettesCss}`)
const glass = strip(glassCss)

type Rgb = [number, number, number]

function block(css: string, selector: string): string {
  const found = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, selectors = '']) =>
    selectors.split(',').some((s) => s.trim() === selector),
  )
  if (!found?.[2]) throw new Error(`No CSS block for ${selector}`)
  return found[2]
}

function hexTokens(selector: string): Record<string, string> {
  return Object.fromEntries(
    [...block(paletteCss, selector).matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(
      ([, name, hex]) => [name, hex],
    ),
  )
}

function percent(selector: string, name: string): number {
  const match = block(glass, selector).match(new RegExp(`--${name}:\\s*([\\d.]+)%`))
  if (!match?.[1]) throw new Error(`--${name} missing in ${selector}`)
  return Number(match[1]) / 100
}

const rgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb
/** `a` at `share`, over `b`: what a see-through colour looks like on top of another. */
const over = (a: Rgb, share: number, b: Rgb): Rgb =>
  a.map((c, i) => c * share + b[i]! * (1 - share)) as Rgb

function luminance([r, g, b]: Rgb): number {
  const channel = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const AA = 4.5
const BLOBS = ['primary', 'ring', 'accent-foreground'] as const

describe.each(PALETTES)('glass on palette %s', (palette) => {
  it.each([
    ['light', `[data-palette='${palette}']`, '.glass'],
    ['dark', `[data-palette='${palette}'].dark`, '.glass.dark'],
  ])('%s stays readable (WCAG AA)', (_mode, paletteSelector, glassSelector) => {
    const t = hexTokens(paletteSelector)
    const wash = percent(glassSelector, 'glass-wash')
    const solid = percent(glassSelector, 'glass-surface')
    const fg = rgb(t.foreground!)
    // Same mix as `.glass :where(.text-muted)` in glass.css (set once on `.glass`).
    const muted = over(rgb(t.muted!), percent('.glass', 'glass-quiet'), fg)

    for (const blob of BLOBS) {
      const page = over(rgb(t[blob]!), wash, rgb(t.background!))
      const card = over(rgb(t.surface!), solid, page)
      expect(contrast(fg, page), `text on page (${blob})`).toBeGreaterThanOrEqual(AA)
      expect(contrast(muted, page), `quiet text on page (${blob})`).toBeGreaterThanOrEqual(AA)
      expect(contrast(fg, card), `text on card (${blob})`).toBeGreaterThanOrEqual(AA)
      expect(contrast(muted, card), `quiet text on card (${blob})`).toBeGreaterThanOrEqual(AA)
      expect(contrast(rgb(t.primary!), card), `links on card (${blob})`).toBeGreaterThanOrEqual(AA)
    }
  })
})
