/** Limits for notes. Kept here so the UI, repo and database agree. */

/** Longest note body, in characters (matches the Postgres CHECK). */
export const NOTE_BODY_MAX = 20_000

/** A recording stops by itself after this long, so a forgotten mic can't fill the device. */
export const MAX_RECORDING_SECONDS = 10 * 60

/** Language the speech service listens for: Egyptian Arabic. */
export const SPEECH_LANG_AR = 'ar-EG'
export const SPEECH_LANG_EN = 'en-US'

/** Audio formats to try, best first. Safari (iPhone) only records `audio/mp4`. */
export const RECORDING_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'] as const
