import { Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { isDone } from '@/core/habits/continuity'
import { localDateISO } from '@/core/time/date'
import { formatGregorian, formatHijri } from '@/core/time/format'
import { useNow } from '@/hooks/useNow'
import { SyncIndicator } from '@/modules/account/components/SyncIndicator'
import { useDayInfo } from '@/modules/days/hooks'
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
  const { dayType, override } = useDayInfo(today)

  const routines = useRoutinesToday(today)
  const minimumMode = useLiveQuery(() => isMinimumMode(today), [today]) ?? false
  const checkedIn = useLiveQuery(async () => Boolean(await getDailyLog(today)), [today])
  const allDone = routines?.length ? routines.every((r) => isDone(r.status)) : false

  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      {/* The "hero": date, Hijri date, day type and next prayer on one calm block. */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-primary to-primary-strong p-5 text-primary-foreground shadow-float sm:p-7 dark:from-accent dark:to-surface dark:text-foreground">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl">{t('today.title')}</h1>
            <p className="text-base opacity-90 sm:text-lg">{formatGregorian(now, language)}</p>
          </div>
          {/* On desktop the sidebar shows it. */}
          <SyncIndicator className="text-current opacity-90 hover:bg-white/10 md:hidden" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-white/12 px-3 py-1 dark:bg-gold-soft dark:text-gold">
            {formatHijri(now, language)}
          </span>
          <Link
            to="/week"
            className="rounded-full bg-white/12 px-3 py-1 underline-offset-4 hover:underline dark:bg-background/60"
          >
            <span className="sr-only">{t('today.dayType')}: </span>
            {t(`dayTypes.${dayType}`)}
            {override?.note && <span dir="auto"> ({override.note})</span>}
          </Link>
        </div>
        <div className="mt-4 border-t border-current/15 pt-4">
          <NextPrayer now={now} />
        </div>
      </header>

      {vision && (
        <blockquote
          dir="auto"
          className="rounded-2xl border-s-4 border-gold bg-gold-soft/50 px-4 py-3 leading-relaxed sm:text-lg"
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
        className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-primary px-4 font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {checkedIn ? t('today.checkInDone') : t('today.checkIn')}
      </Link>
    </div>
  )
}
