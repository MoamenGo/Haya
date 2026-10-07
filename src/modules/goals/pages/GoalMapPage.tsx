import { getRouteApi, Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { AddProjectForm } from '@/modules/projects/components/AddProjectForm'
import { ResourceSection } from '@/modules/resources/components/ResourceSection'
import { GoalEditor } from '../components/GoalEditor'
import { GoalProjectsTree } from '../components/GoalProjectsTree'
import { getGoal } from '../repo'

const route = getRouteApi('/goals/$goalId')

/**
 * The goal map: the goal, the projects that serve it, each project's small
 * steps, and the sources (links) for it, all on one page and all editable.
 */
export function GoalMapPage() {
  const { t } = useTranslation()
  const { goalId } = route.useParams()
  // `null` (not undefined) once loaded, so "missing" and "loading" differ.
  const goal = useLiveQuery(async () => (await getGoal(goalId)) ?? null, [goalId])

  const back = (
    <Link to="/goals" className="text-sm text-primary underline-offset-4 hover:underline">
      {t('goalMap.back')}
    </Link>
  )

  if (goal === undefined) return <p className="text-sm text-muted">{t('states.loading')}</p>
  if (goal === null) {
    return (
      <div className="flex flex-col gap-3">
        {back}
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
          {t('goalMap.missing')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {back}
      <GoalEditor goal={goal} />
      <GoalProjectsTree goalId={goal.id} />
      <Card>
        <AddProjectForm goalId={goal.id} />
      </Card>
      <ResourceSection goalId={goal.id} />
    </div>
  )
}
