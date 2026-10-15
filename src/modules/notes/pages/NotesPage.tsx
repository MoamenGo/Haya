import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { ListSkeleton } from '@/components/ui/skeleton'
import type { NoteRow } from '@/core/db/types'
import { instantOfISO, localDateISO } from '@/core/time/date'
import { formatDayHeading } from '@/core/time/format'
import { useNow } from '@/hooks/useNow'
import { useSetting } from '@/modules/settings/hooks'
import { NoteComposer } from '../components/NoteComposer'
import { NoteItem } from '../components/NoteItem'
import { listNotes } from '../repo'

/** Groups notes (already sorted newest first) by their day. */
function byDay(notes: readonly NoteRow[]): Array<[string, NoteRow[]]> {
  const groups = new Map<string, NoteRow[]>()
  for (const note of notes) {
    const day = groups.get(note.date) ?? []
    day.push(note)
    groups.set(note.date, day)
  }
  return [...groups]
}

/** Daily notes: write or speak a note for today, and read back earlier days. */
export function NotesPage() {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const today = localDateISO(useNow())
  const notes = useLiveQuery(listNotes, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('notes.title')} intro={t('notes.intro')} />
      <SplitLayout asideFirst aside={<NoteComposer date={today} />}>
        {notes === undefined ? (
          <ListSkeleton rows={2} />
        ) : notes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
            {t('notes.empty')}
          </p>
        ) : (
          byDay(notes).map(([date, dayNotes]) => (
            <section key={date} aria-labelledby={`notes-${date}`} className="flex flex-col gap-2">
              <h2 id={`notes-${date}`} className="text-lg font-medium">
                {date === today ? t('notes.today') : formatDayHeading(instantOfISO(date), language)}
              </h2>
              <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
                {dayNotes.map((note) => (
                  <NoteItem key={note.id} note={note} />
                ))}
              </ul>
            </section>
          ))
        )}
      </SplitLayout>
    </div>
  )
}
