import { Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  addDaysISO,
  DAYS_PER_WEEK,
  instantOfISO,
  localDateISO,
  weekStartISO,
} from '@/core/time/date'
import { formatDayMonth } from '@/core/time/format'
import { useNow } from '@/hooks/useNow'
import { getReview } from '@/modules/reviews/repo'
import { WEEKLY_NEXT_KEYS } from '@/modules/reviews/weeklyQuestions'
import { useSetting } from '@/modules/settings/hooks'
import { WeekDayCard } from '../components/WeekDayCard'
import { useWeek } from '../hooks'
import { ListSkeleton } from '@/components/ui/skeleton'

/** Saturday to Friday at a glance; any day's type can be changed here (CLAUDE.md §4.2). */
export function WeekPage() {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const today = localDateISO(useNow())
  const thisWeek = weekStartISO(today)
  const [start, setStart] = useState(thisWeek)
  const end = addDaysISO(start, DAYS_PER_WEEK - 1)
  const days = useWeek(start)
  // The outcomes chosen in last week's review, shown as this week's focus.
  const focus = useLiveQuery(async () => {
    const review = await getReview('weekly', addDaysISO(start, -DAYS_PER_WEEK))
    return WEEKLY_NEXT_KEYS.map((key) => review?.answers[key] ?? '').filter(Boolean)
  }, [start])

  const range = `${formatDayMonth(instantOfISO(start), language)} – ${formatDayMonth(instantOfISO(end), language)}`

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl">{t('week.title')}</h1>
          <Link
            to="/reviews/weekly"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {t('week.review')}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setStart(addDaysISO(start, -DAYS_PER_WEEK))}>
            {t('week.previous')}
          </Button>
          <Button variant="ghost" disabled={start === thisWeek} onClick={() => setStart(thisWeek)}>
            {t('week.thisWeek')}
          </Button>
          <Button variant="outline" onClick={() => setStart(addDaysISO(start, DAYS_PER_WEEK))}>
            {t('week.next')}
          </Button>
          <p className="ms-auto text-sm text-muted">{range}</p>
        </div>
      </header>

      {focus && focus.length > 0 && (
        <section aria-labelledby="focus-title" className="rounded-2xl bg-accent p-4 text-sm">
          <h2 id="focus-title" className="font-medium">
            {t('week.focus')}
          </h2>
          <ol className="mt-2 list-decimal ps-5">
            {focus.map((item) => (
              <li key={item} dir="auto">
                {item}
              </li>
            ))}
          </ol>
        </section>
      )}

      {days === undefined ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {days.map((day) => (
            <WeekDayCard key={day.date} day={day} isToday={day.date === today} />
          ))}
        </div>
      )}
    </div>
  )
}
