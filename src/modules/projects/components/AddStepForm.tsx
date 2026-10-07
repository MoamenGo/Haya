import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addProjectStep } from '../repo'

/** Adds one small step. The hint teaches what "small and actionable" means (CLAUDE.md §6.2). */
export function AddStepForm({ projectId }: { projectId: string }) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const id = `step-${projectId}`

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    await addProjectStep(projectId, title)
    setTitle('')
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-1.5">
      <label htmlFor={id} className="sr-only">
        {t('projects.addStep')}
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={title}
          placeholder={t('projects.stepPlaceholder')}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-sm"
        />
        <Button type="submit" variant="outline" disabled={!title.trim()}>
          {t('projects.addStep')}
        </Button>
      </div>
      <p className="text-xs text-muted">{t('projects.stepHint')}</p>
    </form>
  )
}
