import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ListSkeleton } from '@/components/ui/skeleton'
import { addMonthsISO, daysInMonth, monthStartISO } from '@/core/time/calendar'
import { instantOfISO, localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { useSetting } from '@/modules/settings/hooks'
import { DayPanel } from '../components/DayPanel'
import { MonthGrid } from '../components/MonthGrid'
import { useMonth } from '../hooks'

const HIJRI_MONTH: Record<'ar' | 'en', string> = {
  ar: 'ar-EG-u-ca-islamic-umalqura-nu-latn',
  en: 'en-GB-u-ca-islamic-umalqura',
}

/**
 * The calendar (CLAUDE.md §6.7, brought forward by ADR-007): a month at a
 * glance, and the tasks and study of the day you tap. The chosen day lives in
 * the address (`/calendar?date=…`), so back and refresh keep it.
 */
export function CalendarPage() {
  const { t, i18n } = useTranslation()
  const [language] = useSetting('language')
  const navigate = useNavigate()
  const today = localDateISO(useNow())
  const { date } = useSearch({ from: '/calendar' })
  const selected = date ?? today
  const month = useMonth(selected)
  const rtl = i18n.dir() === 'rtl'
  const Back = rtl ? ChevronRight : ChevronLeft
  const Forward = rtl ? ChevronLeft : ChevronRight

  // Picking a day replaces the address instead of stacking history, so the
  // back button leaves the calendar rather than walking back through taps.
  const select = (next: string, replace = true) =>
    void navigate({ to: '/calendar', search: next === today ? {} : { date: next }, replace })
  // Moving a month keeps the same day number where it exists (31 → 30 …).
  const moveMonth = (months: number) => {
    const target = addMonthsISO(monthStartISO(selected), months)
    const day = Math.min(Number(selected.slice(8)), daysInMonth(target))
    select(`${target.slice(0, 8)}${String(day).padStart(2, '0')}`, false)
  }

  const instant = instantOfISO(selected)
  const monthTitle = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(instant)
  const hijriMonth = new Intl.DateTimeFormat(HIJRI_MONTH[language], {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(instant)
  const selectedDay = month?.days.get(selected)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('calendar.title')}
        action={
          <Link to="/week" className="text-sm text-primary underline-offset-4 hover:underline">
            {t('calendar.weekView')}
          </Link>
        }
      />

      <SplitLayout
        aside={
          selectedDay ? (
            <Card>
              <DayPanel day={selectedDay} today={today} />
            </Card>
          ) : (
            <ListSkeleton rows={3} />
          )
        }
      >
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveMonth(-1)}
              aria-label={t('calendar.previousMonth')}
            >
              <Back aria-hidden className="!size-5" />
            </Button>
            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <h2 className="text-lg" aria-live="polite">
                {monthTitle}
              </h2>
              <p className="text-xs text-muted">{hijriMonth}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveMonth(1)}
              aria-label={t('calendar.nextMonth')}
            >
              <Forward aria-hidden className="!size-5" />
            </Button>
          </div>

          {month ? (
            <MonthGrid
              month={month}
              monthOf={selected}
              selected={selected}
              today={today}
              onSelect={(d) => select(d)}
            />
          ) : (
            <ListSkeleton rows={5} />
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <i aria-hidden className="size-1.5 rounded-full bg-primary" />
                {t('calendar.legendOpen')}
              </span>
              <span className="flex items-center gap-1.5">
                <i aria-hidden className="size-1.5 rounded-full border border-primary" />
                {t('calendar.legendDone')}
              </span>
              <span className="flex items-center gap-1.5">
                <i aria-hidden className="size-3 rounded bg-subtle ring-1 ring-border" />
                {t('calendar.legendHospital')}
              </span>
            </span>
            {selected !== today ? (
              <Button variant="ghost" size="sm" onClick={() => select(today, false)}>
                {t('calendar.backToToday')}
              </Button>
            ) : null}
          </div>
        </Card>
      </SplitLayout>
    </div>
  )
}
