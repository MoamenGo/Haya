import { useCallback, useEffect, useRef, useState } from 'react'
import { MAX_RECORDING_SECONDS, RECORDING_MIME_TYPES } from '@/core/notes/config'
import { joinSpeech, pickMimeType } from '@/core/notes/transcript'
import type { RecordingInput } from './schema'
import { getSpeechRecognition, type SpeechRecognitionLike } from './speech'

const TICK_MS = 1000

export type RecorderState = 'idle' | 'recording'
/** Why recording or transcription could not run, for a calm message in the UI. */
export type RecorderProblem = 'mic_denied' | 'mic_failed' | 'speech_failed' | null

interface Options {
  /** Also turn speech into text while recording. */
  transcribe: boolean
  /** BCP-47 language for speech-to-text, e.g. `ar-EG`. */
  lang: string
  /** Called with each finished sentence of recognized speech. */
  onSpeech: (text: string) => void
}

/**
 * Records audio from the microphone (MediaRecorder) and, if asked, converts
 * speech to text at the same time (SpeechRecognition). The two run
 * independently: if text conversion fails, the recording still works.
 *
 * Why refs and not state: the browser objects (recorder, stream, recognizer)
 * live across renders and must not trigger re-renders when they change.
 */
export function useVoiceRecorder({ transcribe, lang, onSpeech }: Options) {
  const [state, setState] = useState<RecorderState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [interim, setInterim] = useState('')
  const [problem, setProblem] = useState<RecorderProblem>(null)
  const [recording, setRecording] = useState<RecordingInput | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognizerRef = useRef<SpeechRecognitionLike | null>(null)
  const timerRef = useRef<number | null>(null)
  const startedAtRef = useRef(0)
  const onSpeechRef = useRef(onSpeech)
  // Keeps the latest callback without restarting the recognizer when it changes.
  useEffect(() => {
    onSpeechRef.current = onSpeech
  })

  const stopSpeech = useCallback(() => {
    const recognizer = recognizerRef.current
    recognizerRef.current = null
    if (recognizer) {
      recognizer.onend = null
      recognizer.stop()
    }
    setInterim('')
  }, [])

  const stop = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    timerRef.current = null
    stopSpeech()
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [stopSpeech])

  const startSpeech = useCallback(() => {
    const Recognition = getSpeechRecognition()
    if (!Recognition) return
    const recognizer = new Recognition()
    recognizer.lang = lang
    recognizer.continuous = true
    recognizer.interimResults = true
    recognizer.onresult = (event) => {
      const finals: string[] = []
      const pending: string[] = []
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result) continue
        ;(result.isFinal ? finals : pending).push(result[0].transcript)
      }
      if (finals.length) onSpeechRef.current(joinSpeech(finals))
      setInterim(joinSpeech(pending))
    }
    recognizer.onerror = (event) => {
      // "no-speech" just means a quiet moment; it is not worth a message.
      if (event.error !== 'no-speech' && event.error !== 'aborted') setProblem('speech_failed')
    }
    // Chrome ends recognition after a pause; restart it while still recording.
    recognizer.onend = () => {
      if (recognizerRef.current === recognizer) {
        try {
          recognizer.start()
        } catch {
          recognizerRef.current = null
        }
      }
    }
    recognizerRef.current = recognizer
    try {
      recognizer.start()
    } catch {
      recognizerRef.current = null
      setProblem('speech_failed')
    }
  }, [lang])

  const start = useCallback(async () => {
    setProblem(null)
    setRecording(null)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      const denied = error instanceof DOMException && error.name === 'NotAllowedError'
      setProblem(denied ? 'mic_denied' : 'mic_failed')
      return
    }
    streamRef.current = stream
    const mimeType = pickMimeType(RECORDING_MIME_TYPES, (m) => MediaRecorder.isTypeSupported(m))
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.onstop = () => {
      const type = recorder.mimeType || mimeType || 'audio/webm'
      const elapsed = (Date.now() - startedAtRef.current) / 1000
      if (chunks.length)
        setRecording({ blob: new Blob(chunks, { type }), mime_type: type, seconds: elapsed })
      stream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      recorderRef.current = null
      setState('idle')
    }
    recorderRef.current = recorder
    recorder.start()
    startedAtRef.current = Date.now()
    setSeconds(0)
    setState('recording')
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000)
      setSeconds(elapsed)
      if (elapsed >= MAX_RECORDING_SECONDS) stop()
    }, TICK_MS)
    if (transcribe) startSpeech()
  }, [startSpeech, stop, transcribe])

  // Leaving the page releases the microphone.
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
      recognizerRef.current?.stop()
      recognizerRef.current = null
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
    },
    [],
  )

  return {
    state,
    seconds,
    interim,
    problem,
    recording,
    start,
    stop,
    clearRecording: () => setRecording(null),
  }
}
