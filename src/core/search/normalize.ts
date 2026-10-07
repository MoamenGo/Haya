/**
 * Arabic-aware text normalisation for search only (CLAUDE.md §6.20). Stored
 * text is never changed; both the query and the text are normalised before
 * comparing, so "مذاكره" finds "مذاكرة" and "أحمد" finds "احمد".
 */
const TASHKEEL = /[ً-ْٰ]/g // short vowels, shadda, sukun, dagger alif
const TATWEEL = /ـ/g // ـ stretching
const ALIF_FORMS = /[أإآ]/g

export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFC')
    .replace(TASHKEEL, '')
    .replace(TATWEEL, '')
    .replace(ALIF_FORMS, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** True when every word of the query appears somewhere in the text. */
export function matchesSearch(text: string, query: string): boolean {
  const words = normalizeForSearch(query).split(' ').filter(Boolean)
  if (words.length === 0) return true
  const haystack = normalizeForSearch(text)
  return words.every((word) => haystack.includes(word))
}
