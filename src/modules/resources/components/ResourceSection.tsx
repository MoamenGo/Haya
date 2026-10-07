import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { listProjects } from '@/modules/projects/repo'
import { resourcesForGoal } from '../repo'
import { AddResourceForm } from './AddResourceForm'
import { ResourceItem } from './ResourceItem'

/** All links for a goal, with the project each belongs to. */
export function ResourceSection({ goalId }: { goalId: string }) {
  const { t } = useTranslation()
  const resources = useLiveQuery(() => resourcesForGoal(goalId), [goalId])
  const projects =
    useLiveQuery(
      async () =>
        (await listProjects()).filter((i) => i.project.goal_id === goalId).map((i) => i.project),
      [goalId],
    ) ?? []

  return (
    <section aria-labelledby="map-resources" className="flex flex-col gap-3">
      <div>
        <h2 id="map-resources" className="font-medium">
          {t('resources.title')}
        </h2>
        <p className="text-sm text-muted">{t('resources.hint')}</p>
      </div>
      {resources && resources.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {resources.map((resource) => (
            <ResourceItem key={resource.id} resource={resource} projects={projects} />
          ))}
        </ul>
      ) : (
        resources && <p className="text-sm text-muted">{t('resources.empty')}</p>
      )}
      <AddResourceForm goalId={goalId} projects={projects} />
    </section>
  )
}
