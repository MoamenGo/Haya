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

/** "Saturday 10 October": a day's heading in lists like the week view. */
export function formatDayHeading(date: Date, lang: Language, timeZone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat(GREGORIAN_LOCALE[lang], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone,
  }).format(date)
}

/** "18 Rabi' II": the Hijri day and month, without the year. */
export function formatHijriShort(date: Date, lang: Language, timeZone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat(HIJRI_LOCALE[lang], {
    day: 'numeric',
    month: 'long',
    timeZone,
  }).format(date)
}

/** "10 Oct": compact dates for ranges. */
export function formatDayMonth(date: Date, lang: Language, timeZone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat(GREGORIAN_LOCALE[lang], {
    day: 'numeric',
    month: 'short',
    timeZone,
  }).format(date)
}
