import { Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { isDone } from '@/core/habits/continuity'
import { defaultDayType } from '@/core/time/dayType'
import { localDateISO } from '@/core/time/date'
import { formatGregorian, formatHijri } from '@/core/time/format'
import { useNow } from '@/hooks/useNow'
import { getDailyLog } from '@/modules/reviews/repo'
import { setHabitStatus } from '@/modules/routines/repo'
import { useSetting } from '@/modules/settings/hooks'
import { NextPrayer } from '../components/NextPrayer'
import { RoutineCard } from '../components/RoutineCard'
import { TodayTasks } from '../components/TodayTasks'
import { useRoutinesToday } from '../hooks'
import { isMinimumMode, setMinimumMode } from '../repo'

export function TodayPage() {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const [vision] = useSetting('vision')
  const now = useNow()
  const today = localDateISO(now)
  const dayType = defaultDayType(now)

  const routines = useRoutinesToday(today)
  const minimumMode = useLiveQuery(() => isMinimumMode(today), [today]) ?? false
  const checkedIn = useLiveQuery(async () => Boolean(await getDailyLog(today)), [today])
  const allDone = routines?.length ? routines.every((r) => isDone(r.status)) : false

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t('today.title')}</h1>
        <p className="text-muted">{formatGregorian(now, language)}</p>
        <p className="text-sm text-muted">
          {formatHijri(now, language)}
          <span aria-hidden> · </span>
          <span className="sr-only">{t('today.dayType')}: </span>
          {t(`dayTypes.${dayType}`)}
        </p>
        <NextPrayer now={now} />
      </header>

      {vision && (
        <blockquote dir="auto" className="border-s-4 border-primary ps-4 leading-relaxed">
          {vision}
        </blockquote>
      )}

      <TodayTasks today={today} dayType={dayType} minimumMode={minimumMode} />

      <section aria-labelledby="habits-title" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="habits-title" className="text-lg font-medium">
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
          <p role="status" className="rounded-lg bg-accent p-3 text-sm leading-relaxed">
            {t('today.minimumModeOn')}
          </p>
        )}
        {routines === undefined ? (
          <p className="text-sm text-muted">{t('states.loading')}</p>
        ) : (
          routines.map(({ routine, status, days }) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              status={status}
              days={days}
              minimumMode={minimumMode}
              onChange={(next) => void setHabitStatus(routine.id, today, next)}
            />
          ))
        )}
        {allDone && <p className="text-sm text-muted">{t('today.allDone')}</p>}
      </section>

      <Link
        to="/today/review"
        className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground"
      >
        {checkedIn ? t('today.checkInDone') : t('today.checkIn')}
      </Link>
    </div>
  )
}
