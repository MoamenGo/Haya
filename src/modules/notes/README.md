# Notes (الملاحظات)

Daily notes, written or spoken (`/notes`, linked from Today).

- **Text** syncs like every other table (`notes`, Dexie v9 + `supabase/migrations/20261015120000_notes.sql`).
- **Recordings** are saved with `MediaRecorder` into the local-only Dexie table
  `note_audio`. They never go to Supabase (audio would fill the free database)
  and are not in the JSON backup. Other devices see "recorded on another device".
- **Speech-to-text** uses the browser's Web Speech API (`ar-EG`), only when the
  owner ticks the box (setting `voice_transcribe`, off by default), because
  Chrome sends the audio to Google to convert it. Works in Chrome/Edge
  (desktop and Android); Safari only partly; Firefox not at all. The text lands
  in the box so it can be corrected before saving.
- If speech-to-text fails, recording keeps going (the two run independently).
