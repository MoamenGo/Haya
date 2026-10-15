import { Mic, Square, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { NOTE_BODY_MAX, SPEECH_LANG_AR, SPEECH_LANG_EN } from '@/core/notes/config'
import { appendSpeech, formatDuration } from '@/core/notes/transcript'
import { useSetting } from '@/modules/settings/hooks'
import { addNote } from '../repo'
import { canRecordAudio, getSpeechRecognition } from '../speech'
import { useVoiceRecorder } from '../useVoiceRecorder'
import { AudioPlayer } from './AudioPlayer'

/**
 * Write a note, or speak it: the recording is kept, and (if turned on) the
 * speech appears as text in the box, where it can be corrected before saving.
 */
export function NoteComposer({ date }: { date: string }) {
  const { t, i18n } = useTranslation()
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [transcribe, setTranscribe] = useSetting('voice_transcribe')
  const speechAvailable = getSpeechRecognition() !== null
  const recorder = useVoiceRecorder({
    transcribe: transcribe && speechAvailable,
    lang: i18n.language === 'en' ? SPEECH_LANG_EN : SPEECH_LANG_AR,
    onSpeech: (text) => setBody((current) => appendSpeech(current, text)),
  })
  const recording = recorder.state === 'recording'
  const canSave = !recording && !saving && (body.trim() !== '' || recorder.recording !== null)

  async function save() {
    setSaving(true)
    try {
      await addNote({ date, body_md: body }, recorder.recording ?? undefined)
      setBody('')
      recorder.clearRecording()
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      aria-label={t('notes.newNote')}
      className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-4 shadow-card"
    >
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={NOTE_BODY_MAX}
        placeholder={t('notes.placeholder')}
        aria-label={t('notes.newNote')}
        className="min-h-28 leading-relaxed"
      />
      {recording && recorder.interim && (
        <p dir="auto" aria-live="polite" className="text-sm text-muted italic">
          {recorder.interim}
        </p>
      )}
      {recorder.recording && (
        <div className="flex items-center gap-2">
          <AudioPlayer blob={recorder.recording.blob} />
          <Button
            variant="ghost"
            size="icon"
            onClick={recorder.clearRecording}
            aria-label={t('notes.removeRecording')}
          >
            <X aria-hidden />
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {canRecordAudio() &&
          (recording ? (
            <Button variant="danger" onClick={recorder.stop}>
              <Square aria-hidden />
              {t('notes.stop')}
              <span className="tabular-nums" dir="ltr">
                {formatDuration(recorder.seconds)}
              </span>
            </Button>
          ) : (
            <Button variant="outline" onClick={() => void recorder.start()}>
              <Mic aria-hidden />
              {recorder.recording ? t('notes.recordAgain') : t('notes.record')}
            </Button>
          ))}
        <Button onClick={() => void save()} disabled={!canSave} className="ms-auto">
          {t('notes.save')}
        </Button>
      </div>
      {speechAvailable ? (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={transcribe}
            disabled={recording}
            onChange={(e) => void setTranscribe(e.target.checked)}
            className="mt-1 size-4 accent-[var(--primary)]"
          />
          <span className="flex flex-col gap-0.5">
            <span>{t('notes.transcribe')}</span>
            <span className="text-xs text-muted">{t('notes.transcribeHint')}</span>
          </span>
        </label>
      ) : (
        canRecordAudio() && <p className="text-xs text-muted">{t('notes.noSpeech')}</p>
      )}
      {recorder.problem && (
        <p role="status" className="rounded-2xl bg-accent p-3 text-sm text-accent-foreground">
          {t(`notes.problem.${recorder.problem}`)}
        </p>
      )}
    </section>
  )
}
