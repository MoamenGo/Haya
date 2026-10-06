import { useTranslation } from 'react-i18next'
import type { ContinuityDay } from '@/core/habits/continuity'
import { cn } from '@/lib/utils'

/**
 * A quiet row of dots for the last days. Full = filled, minimum = filled
 * lighter (still a success), nothing logged = an empty ring. Never red.
 */
export function ContinuityDots({ days }: { days: ContinuityDay[] }) {
  const { t } = useTranslation()
  return (
    <ol aria-label={t('habit.last7')} className="flex gap-1.5">
      {days.map(({ date, status }) => (
        <li
          key={date}
          title={date}
          aria-label={t('habit.statusOn', {
            date,
            status: status ? t(`habit.${status}`) : t('habit.none'),
          })}
          className={cn(
            'size-2.5 rounded-full',
            status === 'full' && 'bg-primary',
            status === 'minimum' && 'bg-primary/50',
            (status === null || status === 'skipped') && 'border border-border',
          )}
        />
      ))}
    </ol>
  )
}
