import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './ar.json'
import en from './en.json'

export const LANGUAGES = ['ar', 'en'] as const
export type AppLanguage = (typeof LANGUAGES)[number]

export function directionOf(lang: AppLanguage): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr'
}

/** Sets `<html lang dir>` so the browser lays out the page right-to-left for Arabic. */
export function applyDocumentLanguage(lang: AppLanguage): void {
  document.documentElement.lang = lang
  document.documentElement.dir = directionOf(lang)
}

void i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, en: { translation: en } },
  lng: 'ar',
  fallbackLng: 'ar',
  interpolation: { escapeValue: false }, // React already escapes output
})

export default i18n
