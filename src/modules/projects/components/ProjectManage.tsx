import { Pencil, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ProjectRow } from '@/core/db/types'
import { deleteProject, updateProject } from '../repo'

type Mode = 'idle' | 'editing' | 'confirmDelete'

/** Edit a project's name and outcome, or delete it (after one confirmation). */
export function ProjectManage({ project }: { project: ProjectRow }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('idle')
  const [title, setTitle] = useState(project.title)
  const [outcome, setOutcome] = useState(project.outcome)

  async function onSave(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    await updateProject(project.id, { title, outcome })
    setMode('idle')
  }

  if (mode === 'editing') {
    return (
      <form
        onSubmit={onSave}
        className="flex w-full flex-col gap-2 rounded-lg border border-border bg-subtle/50 p-3 text-sm"
      >
        <label className="flex flex-col gap-1">
          {t('projects.titleLabel')}
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          {t('projects.outcomeLabel')}
          <Input value={outcome} onChange={(e) => setOutcome(e.target.value)} />
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={!title.trim()}>
            {t('common.save')}
          </Button>
          <Button variant="ghost" onClick={() => setMode('idle')}>
            {t('projects.cancel')}
          </Button>
        </div>
      </form>
    )
  }

  if (mode === 'confirmDelete') {
    return (
      <div
        role="alert"
        className="flex w-full flex-col gap-2 rounded-lg border border-border bg-subtle/50 p-3 text-sm"
      >
        <p>{t('projects.deleteConfirm', { title: project.title })}</p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => void deleteProject(project.id)}>
            {t('projects.deleteYes')}
          </Button>
          <Button variant="ghost" onClick={() => setMode('idle')}>
            {t('projects.cancel')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-1">
      <Button
        size="icon"
        variant="ghost"
        aria-label={t('common.edit')}
        title={t('common.edit')}
        onClick={() => setMode('editing')}
      >
        <Pencil aria-hidden />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        aria-label={t('projects.delete')}
        title={t('projects.delete')}
        className="hover:text-danger"
        onClick={() => setMode('confirmDelete')}
      >
        <Trash2 aria-hidden />
      </Button>
    </div>
  )
}
