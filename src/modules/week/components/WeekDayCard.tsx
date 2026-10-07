import { Check, Star } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { instantOfISO } from '@/core/time/date'
import { formatDayHeading, formatHijriShort } from '@/core/time/format'
import { cn } from '@/lib/utils'
import { useSetting } from '@/modules/settings/hooks'
import type { WeekDay } from '../hooks'
import { DayTypeEditor } from './DayTypeEditor'

interface WeekDayCardProps {
  day: WeekDay
  isToday: boolean
}

/** One day of the week: its type, how full it is, and its tasks. */
export function WeekDayCard({ day, isToday }: WeekDayCardProps) {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const [editing, setEditing] = useState(false)
  const instant = instantOfISO(day.date)
  const { capacity } = day.load
  const headingId = `day-${day.date}`

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-surface p-4 shadow-card',
        isToday ? 'border-primary ring-2 ring-primary/15' : 'border-border/80',
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={headingId} className="font-medium">
            {formatDayHeading(instant, language)}
            {isToday && (
              <span className="ms-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                {t('week.today')}
              </span>
            )}
          </h2>
          <p className="text-sm text-muted">{formatHijriShort(instant, language)}</p>
        </div>
        <button
          type="button"
          aria-expanded={editing}
          onClick={() => setEditing(!editing)}
          className="min-h-11 rounded-xl border border-border px-3 text-sm transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
        >
          {t(`dayTypes.${day.dayType}`)}
          {day.override && <span className="sr-only"> ({t('week.changed')})</span>}
          {day.override && <span aria-hidden> •</span>}
        </button>
      </header>

      {day.override?.note && (
        <p dir="auto" className="text-sm text-muted">
          {day.override.note}
        </p>
      )}
      {editing && <DayTypeEditor day={day} onDone={() => setEditing(false)} />}

      <p className="text-sm">
        {t('today.capacity', { planned: capacity.planned, plannable: capacity.plannable })}
        {capacity.over && <span className="text-muted"> · {t('week.over')}</span>}
      </p>

      {day.tasks.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {day.tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2">
              {task.status === 'done' ? (
                <Check aria-label={t('week.done')} className="size-4 shrink-0 text-primary" />
              ) : task.is_big_rock ? (
                <Star aria-label={t('week.bigRock')} className="size-4 shrink-0 text-primary" />
              ) : (
                <span aria-hidden className="size-4 shrink-0 text-center text-muted">
                  ·
                </span>
              )}
              <span dir="auto" className={cn(task.status === 'done' && 'text-muted line-through')}>
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      )}

      {(day.checkedIn || day.minimumMode) && (
        <p className="text-sm text-muted">
          {day.minimumMode && t('week.minimumDay')}
          {day.minimumMode && day.checkedIn && ' · '}
          {day.checkedIn && t('week.checkedIn')}
        </p>
      )}
    </section>
  )
}
