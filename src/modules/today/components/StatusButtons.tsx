import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { HabitStatus } from '@/core/db/types'
import { cn } from '@/lib/utils'

const OPTIONS: readonly HabitStatus[] = ['full', 'minimum', 'skipped']

interface StatusButtonsProps {
  label: string
  status: HabitStatus | null
  onChange: (status: HabitStatus | null) => void
}

/**
 * Pick how a habit went today, as one segmented control.
 * Tapping the selected option again clears it.
 */
export function StatusButtons({ label, status, onChange }: StatusButtonsProps) {
  const { t } = useTranslation()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex w-full gap-1 rounded-full bg-background p-1 sm:w-fit"
    >
      {OPTIONS.map((option) => {
        const selected = status === option
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected ? null : option)}
            className={cn(
              'inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-sm whitespace-nowrap sm:px-4 transition-colors focus-visible:outline-2 focus-visible:outline-ring sm:flex-none',
              selected && option !== 'skipped'
                ? 'bg-primary font-medium text-primary-foreground'
                : selected
                  ? 'bg-surface font-medium shadow-card'
                  : 'text-muted hover:text-foreground',
            )}
          >
            {selected && option !== 'skipped' && <Check aria-hidden className="size-4" />}
            {t(`habit.${option}`)}
          </button>
        )
      })}
    </div>
  )
}
