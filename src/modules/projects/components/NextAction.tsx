import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ProjectRow, TaskRow } from '@/core/db/types'
import { setTaskDone } from '@/modules/tasks/repo'
import { setNextAction } from '../repo'

/** Shows the project's next action, or asks for one (CLAUDE.md §6.3). */
export function NextAction({ project, task }: { project: ProjectRow; task: TaskRow | null }) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    await setNextAction(project, title)
    setTitle('')
  }

  if (task) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-accent p-3 text-sm">
        <p>
          <span className="text-muted">{t('projects.next')}: </span>
          <span dir="auto">{task.title}</span>
        </p>
        <Button variant="outline" onClick={() => void setTaskDone(task, true)}>
          {t('projects.nextDone')}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 text-sm">
      <label htmlFor={`next-${project.id}`} className="text-muted">
        {t('projects.noNext')}
      </label>
      <div className="flex gap-2">
        <Input
          id={`next-${project.id}`}
          value={title}
          placeholder={t('projects.nextPlaceholder')}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={!title.trim()}>
          {t('projects.setNext')}
        </Button>
      </div>
    </form>
  )
}
