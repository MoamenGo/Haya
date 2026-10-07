import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { ProjectCard } from '@/modules/projects/components/ProjectCard'
import { listProjects } from '@/modules/projects/repo'

/**
 * The goal's projects drawn as branches of one line, so the page reads as a
 * map: goal → projects → steps (each card holds its own steps).
 */
export function GoalProjectsTree({ goalId }: { goalId: string }) {
  const { t } = useTranslation()
  const all = useLiveQuery(listProjects, [])
  if (all === undefined) return null
  const mine = all.filter((item) => item.project.goal_id === goalId)
  const active = all.filter((item) => item.project.status === 'active').map((i) => i.project)

  return (
    <section aria-labelledby="map-projects" className="flex flex-col gap-3">
      <h2 id="map-projects" className="font-medium">
        {t('goalMap.projects', { count: mine.length })}
      </h2>
      {mine.length === 0 ? (
        <p className="text-sm text-muted">{t('goalMap.noProjects')}</p>
      ) : (
        <ol className="flex flex-col gap-4 border-s-2 border-primary/25 ps-4 sm:ps-6">
          {mine.map((item) => (
            <li key={item.project.id} className="relative">
              {/* The dot where each branch meets the goal's line. */}
              <span
                aria-hidden
                className="absolute -start-[1.3rem] top-6 size-2.5 rounded-full bg-primary sm:-start-[1.8rem]"
              />
              <p className="mb-1 text-xs text-muted">
                {t(`projects.${groupOf(item.project.status)}`)}
              </p>
              <ProjectCard item={item} active={active} showGoalLink={false} />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

/** Projects page group names cover these four; others read as "Not now". */
function groupOf(status: string): 'active' | 'planned' | 'paused' | 'done' {
  return status === 'active' || status === 'paused' || status === 'done' ? status : 'planned'
}
