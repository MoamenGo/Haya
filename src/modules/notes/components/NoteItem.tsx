import { useLiveQuery } from 'dexie-react-hooks'
import { Mic } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import type { NoteRow } from '@/core/db/types'
import { NOTE_BODY_MAX } from '@/core/notes/config'
import { formatDuration } from '@/core/notes/transcript'
import { formatClock } from '@/core/time/format'
import { useSetting } from '@/modules/settings/hooks'
import { deleteNote, getNoteAudio, updateNoteBody } from '../repo'
import { AudioPlayer } from './AudioPlayer'

type Mode = 'idle' | 'editing' | 'confirmDelete'

/** One note: its text, its recording (if on this device), edit and delete. */
export function NoteItem({ note }: { note: NoteRow }) {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const [mode, setMode] = useState<Mode>('idle')
  const [draft, setDraft] = useState(note.body_md)
  // null = no recording on this device; undefined = still loading.
  const audio = useLiveQuery(async () => (await getNoteAudio(note.id)) ?? null, [note.id])
  const time = formatClock(new Date(note.created_at), language)

  async function saveEdit() {
    await updateNoteBody(note.id, draft)
    setMode('idle')
  }

  return (
    <li className="flex flex-col gap-3 px-4 py-4">
      <p className="flex items-center gap-2 text-xs text-muted">
        <span>{time}</span>
        {note.audio_seconds !== null && (
          <span className="inline-flex items-center gap-1">
            <Mic aria-hidden className="size-3" />
            <span dir="ltr" className="tabular-nums">
              {formatDuration(note.audio_seconds)}
            </span>
          </span>
        )}
      </p>
      {mode === 'editing' ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={NOTE_BODY_MAX}
          aria-label={t('notes.edit')}
          className="leading-relaxed"
          autoFocus
        />
      ) : (
        note.body_md && (
          <p dir="auto" className="leading-relaxed break-words whitespace-pre-wrap">
            {note.body_md}
          </p>
        )
      )}
      {audio ? (
        <AudioPlayer blob={audio.blob} />
      ) : (
        note.audio_seconds !== null &&
        audio === null && <p className="text-xs text-muted">{t('notes.audioElsewhere')}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {mode === 'editing' ? (
          <>
            <Button size="sm" onClick={() => void saveEdit()}>
              {t('notes.save')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMode('idle')}>
              {t('notes.cancel')}
            </Button>
          </>
        ) : mode === 'confirmDelete' ? (
          <>
            <span className="self-center text-sm">{t('notes.confirmDelete')}</span>
            <Button size="sm" variant="danger" onClick={() => void deleteNote(note.id)}>
              {t('notes.delete')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMode('idle')}>
              {t('notes.cancel')}
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(note.body_md)
                setMode('editing')
              }}
            >
              {t('notes.edit')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMode('confirmDelete')}>
              {t('notes.delete')}
            </Button>
          </>
        )}
      </div>
    </li>
  )
}
