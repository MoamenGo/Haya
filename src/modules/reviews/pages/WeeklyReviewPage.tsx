import { Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { addDaysISO, DAYS_PER_WEEK, localDateISO, weekStartISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { WeekFactsCard } from '../components/WeekFactsCard'
import { WeeklyReviewForm } from '../components/WeeklyReviewForm'
import { useWeekFacts } from '../hooks'
import { getReview } from '../repo'

/** The Friday review of the current week (Saturday to Friday). 10 minutes, not more. */
export function WeeklyReviewPage() {
  const { t } = useTranslation()
  const start = weekStartISO(localDateISO(useNow()))
  const end = addDaysISO(start, DAYS_PER_WEEK - 1)
  const facts = useWeekFacts(start, end)
  // Wrapped so "no review yet" (row undefined) differs from "still loading".
  const review = useLiveQuery(async () => ({ row: await getReview('weekly', start) }), [start])

  return (
    <div className="flex flex-col gap-5">
      <header>
        <Link to="/week" className="text-sm text-muted underline-offset-4 hover:underline">
          {t('weekly.back')}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{t('weekly.title')}</h1>
        <p className="mt-1 text-muted">{t('weekly.intro')}</p>
      </header>

      {facts && <WeekFactsCard facts={facts} />}

      <Card>
        {review === undefined ? (
          <p className="text-sm text-muted">{t('states.loading')}</p>
        ) : (
          <WeeklyReviewForm key={start} periodStart={start} periodEnd={end} initial={review.row} />
        )}
      </Card>
    </div>
  )
}
