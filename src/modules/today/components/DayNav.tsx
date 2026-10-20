import { Link, useNavigate } from '@tanstack/react-router'
import { CalendarDays, ChevronLeft, ChevronRight, Undo2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { addDaysISO, instantOfISO } from '@/core/time/date'
import { formatDayHeading, formatHijriShort } from '@/core/time/format'
import { useSetting } from '@/modules/settings/hooks'

interface DayNavProps {
  /** The day on screen. */
  date: string
  /** The real today, so we can say "yesterday" / "tomorrow" and offer the way back. */
  today: string
}

/**
 * Moves Today one day back or forward. The date in the middle opens the
 * calendar on that day. The chosen day lives in the address (`/today?date=…`),
 * so the phone's back button and a refresh keep it.
 */
export function DayNav({ date, today }: DayNavProps) {
  const { t, i18n } = useTranslation()
  const [language] = useSetting('language')
  const navigate = useNavigate()
  // "Back in time" points to where reading starts: right in Arabic, left in English.
  const rtl = i18n.dir() === 'rtl'
  const Back = rtl ? ChevronRight : ChevronLeft
  const Forward = rtl ? ChevronLeft : ChevronRight
  const instant = instantOfISO(date)
  const relative =
    date === today
      ? t('dayNav.today')
      : date === addDaysISO(today, -1)
        ? t('dayNav.yesterday')
        : date === addDaysISO(today, 1)
          ? t('dayNav.tomorrow')
          : null

  // Today itself keeps the plain address, so the usual /today link stays "now".
  const go = (target: string) =>
    void navigate({ to: '/today', search: target === today ? {} : { date: target } })

  const arrow =
    'flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-[background-color,border-color,transform] hover:border-border-strong hover:bg-subtle active:scale-95 focus-visible:outline-2 focus-visible:outline-ring desk:size-10'

  return (
    <nav aria-label={t('dayNav.label')} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={arrow}
          onClick={() => go(addDaysISO(date, -1))}
          aria-label={t('dayNav.previous')}
        >
          <Back aria-hidden className="size-5" />
        </button>

        <Link
          to="/calendar"
          search={date === today ? {} : { date }}
          aria-label={t('dayNav.openCalendar')}
          className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 text-center transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
        >
          <CalendarDays aria-hidden className="size-4 shrink-0 text-primary" />
          <span className="truncate font-display font-medium">
            {relative && <span className="text-primary">{relative} · </span>}
            {formatDayHeading(instant, language)}
          </span>
          <span className="hidden text-sm text-muted sm:inline">
            {formatHijriShort(instant, language)}
          </span>
        </Link>

        <button
          type="button"
          className={arrow}
          onClick={() => go(addDaysISO(date, 1))}
          aria-label={t('dayNav.next')}
        >
          <Forward aria-hidden className="size-5" />
        </button>
      </div>

      {date !== today && (
        <button
          type="button"
          onClick={() => go(today)}
          className="inline-flex min-h-10 items-center gap-1.5 self-center rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Undo2 aria-hidden className="size-4" />
          {t('dayNav.backToToday')}
        </button>
      )}
    </nav>
  )
}
