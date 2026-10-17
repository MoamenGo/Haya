import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { applyDocumentLanguage } from '@/i18n'
import { useSetting } from '@/modules/settings/hooks'
import { getSetting } from '@/modules/settings/repo'
import { applyAppearance, resolveTheme } from './appearance'

const DARK_QUERY = '(prefers-color-scheme: dark)'

/** Applies the saved language, theme and palette to the whole page. Renders nothing. */
export function PreferencesSync() {
  const { i18n } = useTranslation()
  const [language] = useSetting('language')
  // Read directly (not useSetting) so we can tell "still loading" from the
  // default, and keep the colours applied from the cache until the real ones arrive.
  const theme = useLiveQuery(() => getSetting('theme'), [])
  const palette = useLiveQuery(() => getSetting('palette'), [])
  // The first paint takes the saved look at once; later changes cross-fade.
  const painted = useRef(false)

  useEffect(() => {
    applyDocumentLanguage(language)
    void i18n.changeLanguage(language)
  }, [language, i18n])

  useEffect(() => {
    if (theme === undefined || palette === undefined) return
    const media = window.matchMedia(DARK_QUERY)
    const apply = () => {
      applyAppearance(
        { palette, ...resolveTheme(theme, media.matches) },
        { animate: painted.current },
      )
      painted.current = true
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme, palette])

  return null
}
