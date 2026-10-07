import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import type { RoutineRow } from '@/core/db/types'
import { GENTLE_ACTIVE_HABITS } from '@/core/planner/config'
import { AddHabitForm } from '../components/AddHabitForm'
import { HabitPresets } from '../components/HabitPresets'
import { HabitRow } from '../components/HabitRow'
import { listRoutines } from '../repo'

/** Manage which habits Today tracks. Logging itself happens on Today. */
export function HabitsPage() {
  const { t } = useTranslation()
  const routines = useLiveQuery(listRoutines, [])
  const active = routines?.filter((r) => r.active) ?? []
  const paused = routines?.filter((r) => !r.active) ?? []

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t('habits.title')} intro={t('habits.intro')} />

      {active.length > GENTLE_ACTIVE_HABITS && (
        <p role="status" className="rounded-2xl bg-accent p-4 text-sm">
          {t('habits.many', { count: active.length })}
        </p>
      )}

      {routines === undefined ? (
        <p className="text-sm text-muted">{t('states.loading')}</p>
      ) : (
        <>
          <HabitList title={t('habits.active')} items={active} empty={t('habits.emptyActive')} />
          {paused.length > 0 && <HabitList title={t('habits.paused')} items={paused} />}
          <HabitPresets existing={routines.map((r) => r.title)} />
        </>
      )}

      <Card>
        <AddHabitForm />
      </Card>
    </div>
  )
}

interface HabitListProps {
  title: string
  items: RoutineRow[]
  empty?: string
}

function HabitList({ title, items, empty }: HabitListProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {items.map((routine) => (
            <HabitRow key={routine.id} routine={routine} />
          ))}
        </ul>
      )}
    </section>
  )
}
