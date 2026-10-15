import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import { RECORDING_MIME_TYPES } from '@/core/notes/config'
import { appendSpeech, formatDuration, joinSpeech, pickMimeType } from '@/core/notes/transcript'
import {
  EmptyNoteError,
  addNote,
  countNotesOn,
  deleteNote,
  getNoteAudio,
  listNotes,
  updateNoteBody,
} from '@/modules/notes/repo'

beforeEach(async () => {
  await db.open()
})

afterEach(async () => {
  await db.delete()
})

describe('transcript helpers', () => {
  it('joins speech pieces with single spaces', () => {
    expect(joinSpeech([' النهارده ', '', 'كان يوم طويل'])).toBe('النهارده كان يوم طويل')
  })

  it('puts dictated text on a new line after typed text', () => {
    expect(appendSpeech('', 'أول جملة')).toBe('أول جملة')
    expect(appendSpeech('كتبت ده  \n', 'وقلت ده')).toBe('كتبت ده\nوقلت ده')
    expect(appendSpeech('كتبت ده', '   ')).toBe('كتبت ده')
  })

  it('formats durations as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(75.9)).toBe('1:15')
    expect(formatDuration(600)).toBe('10:00')
  })

  it('picks the first audio format the browser supports', () => {
    expect(pickMimeType(RECORDING_MIME_TYPES, (m) => m === 'audio/mp4')).toBe('audio/mp4')
    expect(pickMimeType(RECORDING_MIME_TYPES, () => false)).toBe('')
  })
})

describe('notes repo', () => {
  it('saves a typed note for the day and lists newest first', async () => {
    await addNote({ date: '2026-10-14', body_md: 'امبارح' })
    await addNote({ date: '2026-10-15', body_md: '  أول ملاحظة ' })
    await addNote({ date: '2026-10-15', body_md: 'تاني ملاحظة' })
    const notes = await listNotes()
    expect(notes.map((n) => n.body_md)).toEqual(['تاني ملاحظة', 'أول ملاحظة', 'امبارح'])
    expect(notes[0]?.audio_seconds).toBeNull()
    expect(notes[0]?._dirty).toBe(1)
    expect(await countNotesOn('2026-10-15')).toBe(2)
  })

  it('refuses an empty note without a recording', async () => {
    await expect(addNote({ date: '2026-10-15', body_md: '   ' })).rejects.toBeInstanceOf(
      EmptyNoteError,
    )
  })

  it('keeps a voice note’s recording on the device, with its length on the note', async () => {
    const blob = new Blob(['fake audio'], { type: 'audio/webm' })
    const note = await addNote(
      { date: '2026-10-15', body_md: '' },
      { blob, mime_type: 'audio/webm', seconds: 12.4 },
    )
    expect(note.audio_seconds).toBe(12)
    const audio = await getNoteAudio(note.id)
    expect(audio?.mime_type).toBe('audio/webm')
  })

  it('edits the text and marks the note for sync', async () => {
    const note = await addNote({ date: '2026-10-15', body_md: 'نص من الصوت فيه غلطه' })
    await db.notes.update(note.id, { _dirty: 0 })
    await updateNoteBody(note.id, 'نص من الصوت مصلّح')
    const saved = await db.notes.get(note.id)
    expect(saved?.body_md).toBe('نص من الصوت مصلّح')
    expect(saved?._dirty).toBe(1)
  })

  it('soft-deletes the note and removes its local recording', async () => {
    const note = await addNote(
      { date: '2026-10-15', body_md: 'هتتمسح' },
      { blob: new Blob(['x']), mime_type: 'audio/mp4', seconds: 3 },
    )
    await deleteNote(note.id)
    expect(await listNotes()).toHaveLength(0)
    expect((await db.notes.get(note.id))?.deleted_at).not.toBeNull()
    expect(await getNoteAudio(note.id)).toBeUndefined()
  })
})
