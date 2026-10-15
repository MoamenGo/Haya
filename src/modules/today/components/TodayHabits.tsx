import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/skeleton'
import type { DayType } from '@/core/time/config'
import { isDone } from '@/core/habits/continuity'
import { setHabitStatus } from '@/modules/routines/repo'
import { useRoutinesToday } from '../hooks'
import { setMinimumMode } from '../repo'
import { RoutineCard } from './RoutineCard'

interface TodayHabitsProps {
  today: string
  dayType: DayType
  minimumMode: boolean
}

/** Today's habits with the "hard day → minimum" switch (CLAUDE.md §4.5). */
export function TodayHabits({ today, dayType, minimumMode }: TodayHabitsProps) {
  const { t } = useTranslation()
  const routines = useRoutinesToday(today)
  const allDone = routines?.length ? routines.every((r) => isDone(r.status)) : false

  return (
    <section aria-labelledby="habits-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="habits-title" className="text-xl font-medium">
          {t('today.habits')}
        </h2>
        <Button
          variant={minimumMode ? 'outline' : 'ghost'}
          onClick={() => void setMinimumMode(today, dayType, !minimumMode)}
        >
          {minimumMode ? t('today.minimumModeOff') : t('today.minimumMode')}
        </Button>
      </div>
      {minimumMode && (
        <p
          role="status"
          className="rounded-2xl bg-accent p-4 text-sm leading-relaxed text-accent-foreground"
        >
          {t('today.minimumModeOn')}
        </p>
      )}
      {routines === undefined ? (
        <ListSkeleton rows={3} />
      ) : routines.length === 0 ? null : (
        // One panel with rows, rather than a stack of separate cards.
        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
          {routines.map(({ routine, status, days }) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              status={status}
              days={days}
              minimumMode={minimumMode}
              onChange={(next) => void setHabitStatus(routine.id, today, next)}
            />
          ))}
        </ul>
      )}
      {routines?.length === 0 && <p className="text-sm text-muted">{t('today.noHabits')}</p>}
      {allDone && <p className="text-sm text-muted">{t('today.allDone')}</p>}
      <Link to="/habits" className="text-sm text-primary underline-offset-4 hover:underline">
        {t('today.manageHabits')}
      </Link>
    </section>
  )
}
