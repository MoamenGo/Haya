import { useTranslation } from 'react-i18next'
import { sameMonth } from '@/core/time/calendar'
import { instantOfISO, weekdayOfISO } from '@/core/time/date'
import { cn } from '@/lib/utils'
import { useSetting } from '@/modules/settings/hooks'
import type { CalendarMonth } from '../hooks'

/** At most this many task dots under a day; more shows "+n". */
const MAX_DOTS = 3

interface MonthGridProps {
  month: CalendarMonth
  /** Any date of the month on screen. */
  monthOf: string
  selected: string
  today: string
  onSelect: (date: string) => void
}

const HIJRI_DAY: Record<'ar' | 'en', string> = {
  ar: 'ar-EG-u-ca-islamic-umalqura-nu-latn',
  en: 'en-GB-u-ca-islamic-umalqura',
}

/**
 * A month, Saturday to Friday. Each day shows its Gregorian and Hijri day,
 * a dot per task (filled = still open, hollow = done) and a soft tint on
 * hospital days. The selected day is outlined; today has a filled circle.
 */
export function MonthGrid({ month, monthOf, selected, today, onSelect }: MonthGridProps) {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  // Short names written for a narrow column ("خميس", not "الخميس"), indexed
  // like JavaScript weekdays: 0 = Sunday … 6 = Saturday.
  const weekdays = t('calendar.weekdays', { returnObjects: true }) as string[]
  const hijriDay = new Intl.DateTimeFormat(HIJRI_DAY[language], { day: 'numeric', timeZone: 'UTC' })
  const fullDate = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
  const header = month.weeks[0] ?? []

  return (
    <div role="grid" aria-label={t('calendar.grid')} className="flex flex-col gap-1">
      <div role="row" className="grid grid-cols-7 gap-1">
        {header.map((date) => (
          <span
            key={date}
            role="columnheader"
            className="pb-1 text-center text-xs font-medium text-muted"
          >
            {weekdays[weekdayOfISO(date)]}
          </span>
        ))}
      </div>

      {month.weeks.map((week) => (
        <div key={week[0]} role="row" className="grid grid-cols-7 gap-1">
          {week.map((date) => {
            const day = month.days.get(date)
            const tasks = day?.tasks ?? []
            // Open tasks first (filled dots), then the done ones (hollow).
            const open = tasks.filter((task) => task.status !== 'done')
            const ordered = [...open, ...tasks.filter((task) => task.status === 'done')]
            const inMonth = sameMonth(date, monthOf)
            const isSelected = date === selected
            const isToday = date === today
            const instant = instantOfISO(date)
            const label = [
              fullDate.format(instant),
              day && t(`dayTypes.${day.dayType}`),
              tasks.length ? t('calendar.tasksCount', { count: tasks.length }) : null,
            ]
              .filter(Boolean)
              .join('، ')
            return (
              <button
                key={date}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                aria-current={isToday ? 'date' : undefined}
                aria-label={label}
                onClick={() => onSelect(date)}
                className={cn(
                  'flex aspect-square min-h-12 flex-col items-center justify-between rounded-xl border p-1 transition-[background-color,border-color,transform] duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-ring sm:aspect-[5/4] sm:p-1.5',
                  day?.dayType === 'hospital' ? 'bg-subtle' : 'bg-surface',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-border-strong',
                  !inMonth && 'opacity-45',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-sm tabular-nums',
                    isToday ? 'bg-primary font-semibold text-primary-foreground' : 'font-medium',
                  )}
                >
                  {Number(date.slice(8))}
                </span>
                <span className="text-xs leading-none text-muted tabular-nums">
                  {hijriDay.format(instant)}
                </span>
                <span aria-hidden className="flex h-2 items-center gap-0.5">
                  {ordered.slice(0, MAX_DOTS).map((task, i) => (
                    <i
                      key={task.id}
                      className={cn(
                        'size-1.5 rounded-full',
                        i < open.length ? 'bg-primary' : 'border border-primary',
                      )}
                    />
                  ))}
                  {tasks.length > MAX_DOTS && (
                    <span className="text-[0.625rem] leading-none text-muted">
                      +{tasks.length - MAX_DOTS}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
