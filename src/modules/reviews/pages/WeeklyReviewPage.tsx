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
import { PageHeader } from '@/components/layout/PageHeader'
import { ListSkeleton } from '@/components/ui/skeleton'

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
      <PageHeader
        title={t('weekly.title')}
        intro={t('weekly.intro')}
        eyebrow={
          <Link
            to="/week"
            className="w-fit text-sm text-muted underline-offset-4 hover:text-primary hover:underline"
          >
            {t('weekly.back')}
          </Link>
        }
      />

      {facts && <WeekFactsCard facts={facts} />}

      <Card>
        {review === undefined ? (
          <ListSkeleton rows={3} />
        ) : (
          <WeeklyReviewForm key={start} periodStart={start} periodEnd={end} initial={review.row} />
        )}
      </Card>
    </div>
  )
}
