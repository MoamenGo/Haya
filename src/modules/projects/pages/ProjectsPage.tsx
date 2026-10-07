import { Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { MAX_ACTIVE_PROJECTS } from '@/core/planner/config'
import { AddProjectForm } from '../components/AddProjectForm'
import { ProjectCard } from '../components/ProjectCard'
import { StarterGoalsCard } from '../components/StarterGoalsCard'
import { listProjects, type ProjectWithNext } from '../repo'
import { PageHeader } from '@/components/layout/PageHeader'

const GROUPS = ['active', 'planned', 'paused', 'done'] as const

export function ProjectsPage() {
  const { t } = useTranslation()
  const items = useLiveQuery(listProjects, [])
  const byStatus = (status: string) => items?.filter((i) => i.project.status === status) ?? []
  const active = byStatus('active').map((i) => i.project)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('projects.title')}
        action={
          <Link to="/goals" className="text-sm text-primary underline-offset-4 hover:underline">
            {t('projects.goals')}
          </Link>
        }
      />

      <div className="rounded-2xl bg-accent p-4 text-sm">
        <p className="font-medium">
          {t('projects.wip', { active: active.length, max: MAX_ACTIVE_PROJECTS })}
        </p>
        <p className="mt-1 text-muted">{t('projects.wipHint')}</p>
      </div>

      <StarterGoalsCard />

      {items === undefined ? (
        <p className="text-sm text-muted">{t('states.loading')}</p>
      ) : (
        GROUPS.map((status) => (
          <ProjectGroup
            key={status}
            title={t(`projects.${status}`)}
            items={byStatus(status)}
            active={active}
            empty={status === 'active' ? t('projects.emptyActive') : null}
          />
        ))
      )}

      <Card>
        <AddProjectForm />
      </Card>
    </div>
  )
}

interface ProjectGroupProps {
  title: string
  items: ProjectWithNext[]
  active: ProjectWithNext['project'][]
  empty: string | null
}

function ProjectGroup({ title, items, active, empty }: ProjectGroupProps) {
  if (items.length === 0 && !empty) return null
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        items.map((item) => <ProjectCard key={item.project.id} item={item} active={active} />)
      )}
    </section>
  )
}
