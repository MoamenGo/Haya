/**
 * Small pure helpers for turning speech-recognition results into note text.
 * Kept apart from the browser APIs so they can be unit-tested.
 */

/** Joins pieces of speech with single spaces, dropping empty ones. */
export function joinSpeech(pieces: readonly string[]): string {
  return pieces
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ')
}

/**
 * Adds spoken text after what the owner already typed: on a new line if the
 * note already has text, so dictation never runs into a typed sentence.
 */
export function appendSpeech(body: string, speech: string): string {
  const addition = speech.trim()
  if (!addition) return body
  const base = body.trimEnd()
  return base ? `${base}\n${addition}` : addition
}

/** `75` → `1:15`, for the recording timer and the audio length label. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

/** The first audio format this browser can record, or '' to let it choose. */
export function pickMimeType(
  candidates: readonly string[],
  isSupported: (mime: string) => boolean,
): string {
  return candidates.find((mime) => isSupported(mime)) ?? ''
}
