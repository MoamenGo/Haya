import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import type { GoalRow } from '@/core/db/types'
import { AddGoalForm } from '../components/AddGoalForm'
import { GoalCard } from '../components/GoalCard'
import { listGoals } from '../repo'
import { PageHeader } from '@/components/layout/PageHeader'
import { ListSkeleton } from '@/components/ui/skeleton'

/** Paused/planned goals show with "Not now": both are "not a commitment right now". */
const GROUPS: ReadonlyArray<{ key: 'active' | 'idea' | 'done'; match: (g: GoalRow) => boolean }> = [
  { key: 'active', match: (g) => g.status === 'active' },
  { key: 'idea', match: (g) => ['idea', 'planned', 'paused'].includes(g.status) },
  { key: 'done', match: (g) => g.status === 'done' },
]

export function GoalsPage() {
  const { t } = useTranslation()
  const goals = useLiveQuery(listGoals, [])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t('goals.title')} intro={t('goals.intro')} />
      {goals === undefined ? (
        <ListSkeleton rows={3} />
      ) : goals.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
          {t('goals.empty')}
        </p>
      ) : (
        GROUPS.map(({ key, match }) => {
          const group = goals.filter(match)
          if (group.length === 0) return null
          return (
            <section key={key} className="flex flex-col gap-3">
              <h2 className="font-medium">{t(`goals.${key}`)}</h2>
              {group.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </section>
          )
        })
      )}
      <Card>
        <AddGoalForm />
      </Card>
    </div>
  )
}
