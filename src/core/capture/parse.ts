/**
 * Light, deterministic capture parsing (CLAUDE.md §6.1). No AI: just a few
 * rules the owner can predict. The original text is always kept as typed.
 */
export interface ParsedCapture {
  text: string
  kindHint: 'link' | null
  isImportant: boolean
  tags: string[]
}

const URL_PATTERN = /https?:\/\/\S+/i
// `#` followed by letters (Arabic or Latin), digits, `_` or `-`.
const TAG_PATTERN = /#([\p{L}\p{N}_-]+)/gu
const IMPORTANT_MARK = '!'

/** The text without the `!` markers, for use as a task title. */
export function titleFromCapture(text: string): string {
  return text.replace(/^!+|!+$/g, '').trim()
}

export function parseCapture(raw: string): ParsedCapture {
  const text = raw.trim()
  const tags = [...text.matchAll(TAG_PATTERN)].map((m) => m[1]!)
  return {
    text,
    kindHint: URL_PATTERN.test(text) ? 'link' : null,
    isImportant: text.startsWith(IMPORTANT_MARK) || text.endsWith(IMPORTANT_MARK),
    tags: [...new Set(tags)],
  }
}
