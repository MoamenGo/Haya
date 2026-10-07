import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { createTask } from '../repo'

/** One line to add a task. `scheduledDate` null = "later". */
export function AddTaskForm({ scheduledDate }: { scheduledDate: string | null }) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    await createTask({ title, scheduled_date: scheduledDate })
    setTitle('')
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <label htmlFor="new-task" className="sr-only">
        {t('tasks.add')}
      </label>
      <input
        id="new-task"
        dir="auto"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('tasks.addPlaceholder')}
        className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface-raised px-3 focus-visible:outline-2 focus-visible:outline-primary"
      />
      <Button type="submit" disabled={!title.trim()}>
        {t('tasks.addButton')}
      </Button>
    </form>
  )
}
