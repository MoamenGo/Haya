import { Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { setHabitStatus } from '@/modules/routines/repo'
import { StatusButtons } from '@/modules/today/components/StatusButtons'
import { useRoutinesToday } from '@/modules/today/hooks'
import { DailyLogForm } from '../components/DailyLogForm'
import { getDailyLog } from '../repo'

/** The one-minute evening check-in (CLAUDE.md §6.18, plan step 4). */
export function EveningReviewPage() {
  const { t } = useTranslation()
  const today = localDateISO(useNow())
  const routines = useRoutinesToday(today)
  // Wrapped in an object so "no log yet" (undefined) differs from "still loading".
  const log = useLiveQuery(async () => ({ row: await getDailyLog(today) }), [today])

  return (
    <div className="flex flex-col gap-5">
      <header>
        <Link to="/today" className="text-sm text-muted underline-offset-4 hover:underline">
          {t('review.back')}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{t('review.title')}</h1>
        <p className="mt-1 text-muted">{t('review.intro')}</p>
      </header>

      <Card className="flex flex-col gap-4">
        <h2 className="font-medium">{t('review.habits')}</h2>
        {routines?.map(({ routine, status }) => (
          <div key={routine.id} className="flex flex-col gap-2">
            <p className="text-sm">{routine.title}</p>
            <StatusButtons
              label={routine.title}
              status={status}
              onChange={(next) => void setHabitStatus(routine.id, today, next)}
            />
          </div>
        ))}
      </Card>

      <Card>
        {log === undefined ? (
          <p className="text-sm text-muted">{t('states.loading')}</p>
        ) : (
          // `key` resets the form if the date changes at midnight while it is open.
          <DailyLogForm key={today} dateISO={today} initial={log.row} />
        )}
      </Card>
    </div>
  )
}
