import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ChoiceGroup } from '@/components/ui/choice-group'
import { RESOURCE_STATUSES, type ProjectRow, type ResourceRow } from '@/core/db/types'
import { deleteResource, setResourceStatus } from '../repo'

interface ResourceItemProps {
  resource: ResourceRow
  projects: ProjectRow[]
}

/** One link: opens in a new tab; status and delete below it. */
export function ResourceItem({ resource, projects }: ResourceItemProps) {
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState(false)
  const project = projects.find((p) => p.id === resource.project_id)
  const host = new URL(resource.url).hostname.replace(/^www\./, '')

  return (
    <li className="flex flex-col gap-2 p-4">
      <a
        href={resource.url}
        target="_blank"
        // noopener: the opened page can't control this tab. noreferrer: it isn't told where you came from.
        rel="noopener noreferrer"
        className="group flex items-start gap-2 hover:text-primary"
      >
        <ExternalLink
          aria-hidden
          className="mt-1 size-4 shrink-0 text-muted group-hover:text-primary"
        />
        <span className="min-w-0">
          <span dir="auto" className="block break-words font-medium">
            {resource.title || host}
          </span>
          <span className="block text-xs text-muted" dir="ltr">
            {host}
          </span>
        </span>
      </a>
      <p className="text-xs text-muted">
        {t(`resources.types.${resource.type}`)}
        {project && <> · {project.title}</>}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ChoiceGroup
          label={t('resources.statusLabel', { title: resource.title || host })}
          value={resource.status}
          options={RESOURCE_STATUSES.filter((s) => s !== 'dropped').map((s) => ({
            value: s,
            label: t(`resources.status.${s}`),
          }))}
          onChange={(status) => void setResourceStatus(resource.id, status)}
        />
        {confirming ? (
          <span className="flex gap-1">
            <Button variant="outline" onClick={() => void deleteResource(resource.id)}>
              {t('resources.deleteYes')}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              {t('projects.cancel')}
            </Button>
          </span>
        ) : (
          <Button variant="ghost" onClick={() => setConfirming(true)}>
            {t('common.delete')}
          </Button>
        )}
      </div>
    </li>
  )
}
