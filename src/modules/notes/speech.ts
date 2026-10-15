/**
 * The browser's speech-to-text API (Web Speech API). TypeScript's built-in
 * types don't include it yet, so the small part we use is described here.
 * Chrome (desktop and Android) and Edge support it; Safari only partly, and
 * Firefox not at all. In Chrome the audio is sent to Google to be converted.
 */

export interface SpeechResultLike {
  readonly isFinal: boolean
  readonly 0: { readonly transcript: string }
}

export interface SpeechResultEventLike {
  readonly resultIndex: number
  readonly results: ArrayLike<SpeechResultLike>
}

export interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechResultEventLike) => void) | null
  onerror: ((event: { readonly error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

/** The browser's SpeechRecognition class, or null where speech-to-text isn't available. */
export function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function canRecordAudio(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  )
}
