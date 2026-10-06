import { DEFAULT_TIMEZONE } from './config'

export type Language = 'ar' | 'en'

/**
 * Locale tags. `nu-latn` keeps Western digits (1, 2, 3) in Arabic, the
 * default from CLAUDE.md §9. Hijri uses the Umm al-Qura calendar that is
 * built into the browser, so no library or network is needed.
 */
const GREGORIAN_LOCALE: Record<Language, string> = { ar: 'ar-EG-u-nu-latn', en: 'en-GB' }
const HIJRI_LOCALE: Record<Language, string> = {
  ar: 'ar-EG-u-ca-islamic-umalqura-nu-latn',
  en: 'en-GB-u-ca-islamic-umalqura',
}

export function formatGregorian(date: Date, lang: Language, timeZone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat(GREGORIAN_LOCALE[lang], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(date)
}

export function formatHijri(date: Date, lang: Language, timeZone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat(HIJRI_LOCALE[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(date)
}
