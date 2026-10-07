import { Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { isDone } from '@/core/habits/continuity'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { useDayInfo } from '@/modules/days/hooks'
import { getDailyLog } from '@/modules/reviews/repo'
import { setHabitStatus } from '@/modules/routines/repo'
import { useSetting } from '@/modules/settings/hooks'
import { PrayerSky } from '../components/PrayerSky'
import { RoutineCard } from '../components/RoutineCard'
import { TodayTasks } from '../components/TodayTasks'
import { useRoutinesToday } from '../hooks'
import { isMinimumMode, setMinimumMode } from '../repo'

export function TodayPage() {
  const { t } = useTranslation()
  const [vision] = useSetting('vision')
  const now = useNow()
  const today = localDateISO(now)
  const { dayType, override } = useDayInfo(today)

  const routines = useRoutinesToday(today)
  const minimumMode = useLiveQuery(() => isMinimumMode(today), [today]) ?? false
  const checkedIn = useLiveQuery(async () => Boolean(await getDailyLog(today)), [today])
  const allDone = routines?.length ? routines.every((r) => isDone(r.status)) : false

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <PrayerSky now={now} dayType={dayType} note={override?.note} />

      {vision && (
        <blockquote
          dir="auto"
          className="font-display max-w-prose px-1 text-xl leading-relaxed text-primary"
        >
          {vision}
        </blockquote>
      )}

      <TodayTasks
        today={today}
        dayType={dayType}
        customMinutes={override?.capacity_min ?? null}
        minimumMode={minimumMode}
      />

      <section aria-labelledby="habits-title" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="habits-title" className="text-lg font-semibold">
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
          <p role="status" className="rounded-2xl bg-accent p-4 text-sm leading-relaxed">
            {t('today.minimumModeOn')}
          </p>
        )}
        {routines === undefined ? (
          <p className="text-sm text-muted">{t('states.loading')}</p>
        ) : routines.length === 0 ? null : (
          // One panel with rows, rather than a stack of separate cards.
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
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

      <Link
        to="/today/review"
        className="inline-flex min-h-13 items-center justify-center rounded-full bg-foreground px-6 font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:self-start"
      >
        {checkedIn ? t('today.checkInDone') : t('today.checkIn')}
      </Link>
    </div>
  )
}
