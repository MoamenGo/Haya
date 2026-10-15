import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { NoteAudioRow, NoteRow } from '@/core/db/types'
import { noteInput, type NoteInput, type RecordingInput } from './schema'

/** The only code that reads or writes `notes` and `note_audio`. */

export class EmptyNoteError extends Error {
  constructor() {
    super('A note needs some text or a recording.')
  }
}

/**
 * Saves a note, with its recording if there is one. Both are written in one
 * transaction, so a note never ends up pointing at a missing recording.
 */
export async function addNote(input: NoteInput, recording?: RecordingInput): Promise<NoteRow> {
  const valid = noteInput.parse(input)
  if (!valid.body_md && !recording) throw new EmptyNoteError()

  const row: NoteRow = {
    ...newRowMeta(),
    date: valid.date,
    body_md: valid.body_md,
    audio_seconds: recording ? Math.round(recording.seconds) : null,
  }
  await db.transaction('rw', db.notes, db.note_audio, async () => {
    await db.notes.add(row)
    if (recording) {
      await db.note_audio.add({
        note_id: row.id,
        blob: recording.blob,
        mime_type: recording.mime_type,
        created_at: row.created_at,
      })
    }
  })
  return row
}

/** All notes, newest day first and newest note first within a day. */
export async function listNotes(): Promise<NoteRow[]> {
  const rows = await db.notes.toArray()
  return rows
    .filter((n) => !n.deleted_at)
    .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
}

export async function countNotesOn(date: string): Promise<number> {
  const rows = await db.notes.where('date').equals(date).toArray()
  return rows.filter((n) => !n.deleted_at).length
}

export async function updateNoteBody(id: string, body: string): Promise<void> {
  const { body_md } = noteInput.pick({ body_md: true }).parse({ body_md: body })
  await db.notes.update(id, { body_md, ...touchMeta() })
}

/** The recording saved on this device, if any (recordings don't sync). */
export async function getNoteAudio(noteId: string): Promise<NoteAudioRow | undefined> {
  return db.note_audio.get(noteId)
}

/**
 * Deletes a note the owner chose to delete. The note is soft-deleted so the
 * deletion syncs; its recording only ever lived on this device, so it is removed.
 */
export async function deleteNote(id: string): Promise<void> {
  await db.transaction('rw', db.notes, db.note_audio, async () => {
    await db.notes.update(id, { deleted_at: new Date().toISOString(), ...touchMeta() })
    await db.note_audio.delete(id)
  })
}
