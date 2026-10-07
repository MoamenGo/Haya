import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { createTask } from '../repo'

interface QuickAddProps {
  todayISO: string
  /** Today's list adds for today; the "later" view adds undated tasks. */
  scheduleToday: boolean
}

/** Type and press Enter: the five-second way to add a task (CLAUDE.md §1.6). */
export function QuickAdd({ todayISO, scheduleToday }: QuickAddProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    await createTask({ title, scheduled_date: scheduleToday ? todayISO : null })
    setTitle('')
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface/60 px-3 transition-colors focus-within:border-solid focus-within:border-primary focus-within:bg-surface sm:px-4"
    >
      <Plus aria-hidden className="size-5 shrink-0 text-primary" />
      <label htmlFor="quick-add" className="sr-only">
        {t('tasks.add')}
      </label>
      <input
        id="quick-add"
        dir="auto"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={scheduleToday ? t('tasks.quickAddToday') : t('tasks.quickAddLater')}
        // The form's border shows focus, so the input itself needs no outline.
        className="min-h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted md:text-sm"
      />
      {title.trim() && (
        <kbd className="hidden rounded border border-border bg-subtle px-1.5 text-[0.6875rem] text-muted sm:inline">
          Enter
        </kbd>
      )}
    </form>
  )
}
