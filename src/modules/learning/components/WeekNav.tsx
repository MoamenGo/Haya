import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { instantOfISO } from '@/core/time/date'
import { formatDayMonth } from '@/core/time/format'
import { useSetting } from '@/modules/settings/hooks'

interface WeekNavProps {
  week: number
  totalWeeks: number
  /** The plan's week today, to jump back to (null outside the plan's dates). */
  currentWeek: number | null
  phase: string
  firstDate: string
  lastDate: string
  onChange: (week: number) => void
}

/** Previous / next week, with the week's number, phase and dates in the middle. */
export function WeekNav(props: WeekNavProps) {
  const { week, totalWeeks, currentWeek, phase, firstDate, lastDate, onChange } = props
  const { t, i18n } = useTranslation()
  const [language] = useSetting('language')
  // "Previous" points toward the start of the line: right in Arabic, left in English.
  const rtl = i18n.dir() === 'rtl'
  const Prev = rtl ? ChevronRight : ChevronLeft
  const Next = rtl ? ChevronLeft : ChevronRight
  const range = `${formatDayMonth(instantOfISO(firstDate), language)} – ${formatDayMonth(instantOfISO(lastDate), language)}`

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-full items-center justify-between gap-2 rounded-full border border-border bg-surface p-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('learning.prevWeek')}
          disabled={week <= 1}
          onClick={() => onChange(week - 1)}
        >
          <Prev aria-hidden />
        </Button>
        <div className="min-w-0 text-center" aria-live="polite">
          <p className="font-display font-medium">
            {t('learning.weekOfTotal', { week, total: totalWeeks })}
          </p>
          <p dir="auto" className="truncate text-xs text-muted">
            {[phase, range].filter(Boolean).join(' · ')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('learning.nextWeek')}
          disabled={week >= totalWeeks}
          onClick={() => onChange(week + 1)}
        >
          <Next aria-hidden />
        </Button>
      </div>
      {currentWeek !== null && week !== currentWeek && (
        <Button variant="ghost" size="sm" onClick={() => onChange(currentWeek)}>
          {t('learning.thisWeek')}
        </Button>
      )}
    </div>
  )
}
