import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { applyDocumentLanguage } from '@/i18n'
import { useSetting } from '@/modules/settings/hooks'

const DARK_QUERY = '(prefers-color-scheme: dark)'

/** Applies the saved language and theme to the whole page. Renders nothing. */
export function PreferencesSync() {
  const { i18n } = useTranslation()
  const [language] = useSetting('language')
  const [theme] = useSetting('theme')

  useEffect(() => {
    applyDocumentLanguage(language)
    void i18n.changeLanguage(language)
  }, [language, i18n])

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return null
}
