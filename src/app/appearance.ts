/**
 * Puts the chosen palette, light/dark mode and the glass look on <html>.
 *
 * Settings live in IndexedDB, which opens a moment after the page starts, so
 * the last choice is also kept in localStorage and applied before the first
 * paint. That avoids a flash of the default colours. Storage can be blocked
 * (private windows), so every access is wrapped in try/catch.
 */
const STORAGE_KEY = 'haya.appearance' // kept from the Haya days so the cache survives the rename

export type ThemeChoice = 'system' | 'light' | 'dark' | 'glass'

export interface Appearance {
  palette: string
  dark: boolean
  /** Frosted, see-through surfaces over a soft colour wash (src/styles/glass.css). */
  glass: boolean
}

/**
 * Turns the theme setting into what the page needs. "Glass" is a look, not a
 * colour mode: it follows the device's light or dark, like "system" does.
 */
export function resolveTheme(
  theme: ThemeChoice,
  deviceIsDark: boolean,
): Pick<Appearance, 'dark' | 'glass'> {
  const followsDevice = theme === 'system' || theme === 'glass'
  return {
    dark: theme === 'dark' || (followsDevice && deviceIsDark),
    glass: theme === 'glass',
  }
}

function paint({ palette, dark, glass }: Appearance): void {
  const root = document.documentElement
  root.dataset.palette = palette
  root.classList.toggle('dark', dark)
  root.classList.toggle('glass', glass)
  // The phone's status bar takes the page background of the new palette.
  const background = getComputedStyle(root).getPropertyValue('--background').trim()
  if (background) {
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => (meta.content = background))
  }
}

/**
 * Applies the look. With `animate`, the old and new looks cross-fade (View
 * Transitions API) instead of snapping; browsers without it just switch.
 * The reduced-motion rule in index.css turns the fade off for people who ask.
 */
export function applyAppearance(appearance: Appearance, { animate = false } = {}): void {
  const doc = document as Document & { startViewTransition?: (update: () => void) => unknown }
  if (animate && typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(() => paint(appearance))
  } else {
    paint(appearance)
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance))
  } catch {
    // Not saved; the next start shows the default colours for a moment.
  }
}

/** Called once in main.tsx, before React renders. */
export function applyCachedAppearance(): void {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? 'null',
    ) as Partial<Appearance> | null
    if (saved && typeof saved.palette === 'string') {
      applyAppearance({
        palette: saved.palette,
        dark: Boolean(saved.dark),
        glass: Boolean(saved.glass),
      })
    }
  } catch {
    // Nothing cached or storage blocked: the defaults from CSS stay.
  }
}
