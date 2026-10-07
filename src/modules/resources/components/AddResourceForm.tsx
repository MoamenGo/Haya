import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ProjectRow } from '@/core/db/types'
import { DuplicateResourceError, InvalidUrlError, addResource } from '../repo'

interface AddResourceFormProps {
  goalId: string
  projects: ProjectRow[]
}

/** Paste a link, optionally name it and attach it to one of the goal's projects. */
export function AddResourceForm({ goalId, projects }: AddResourceFormProps) {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      await addResource({ url, title, goal_id: goalId, project_id: projectId || null })
      setUrl('')
      setTitle('')
      setError(null)
    } catch (caught) {
      if (caught instanceof InvalidUrlError) setError(t('resources.invalid'))
      else if (caught instanceof DuplicateResourceError) setError(t('resources.duplicate'))
      else throw caught
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-6"
    >
      <h3 className="font-medium">{t('resources.add')}</h3>
      <label className="flex flex-col gap-1 text-sm">
        {t('resources.urlLabel')}
        <Input
          // Plain text, not type="url": the browser would refuse "example.com" without https://.
          inputMode="url"
          dir="ltr"
          value={url}
          placeholder="https://"
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('resources.titleLabel')}
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      {projects.length > 0 && (
        <label className="flex flex-col gap-1 text-sm">
          {t('resources.projectLabel')}
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="min-h-11 rounded-xl border border-border bg-surface-raised px-3"
          >
            <option value="">{t('resources.wholeGoal')}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-accent p-2 text-sm">
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={!url.trim()}>
          {t('resources.save')}
        </Button>
      </div>
    </form>
  )
}
