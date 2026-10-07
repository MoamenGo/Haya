/**
 * Puts the chosen palette and light/dark mode on <html>.
 *
 * Settings live in IndexedDB, which opens a moment after the page starts, so
 * the last choice is also kept in localStorage and applied before the first
 * paint. That avoids a flash of the default colours. Storage can be blocked
 * (private windows), so every access is wrapped in try/catch.
 */
const STORAGE_KEY = 'haya.appearance'

interface Appearance {
  palette: string
  dark: boolean
}

export function applyAppearance({ palette, dark }: Appearance): void {
  const root = document.documentElement
  root.dataset.palette = palette
  root.classList.toggle('dark', dark)
  // The phone's status bar takes the page background of the new palette.
  const background = getComputedStyle(root).getPropertyValue('--background').trim()
  if (background) {
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => (meta.content = background))
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ palette, dark }))
  } catch {
    // Not saved; the next start shows the default colours for a moment.
  }
}

/** Called once in main.tsx, before React renders. */
export function applyCachedAppearance(): void {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Appearance | null
    if (saved && typeof saved.palette === 'string') applyAppearance(saved)
  } catch {
    // Nothing cached or storage blocked: the defaults from CSS stay.
  }
}
