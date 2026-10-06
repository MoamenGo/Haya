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

/** Pick how a habit went today. Tapping the selected option again clears it. */
export function StatusButtons({ label, status, onChange }: StatusButtonsProps) {
  const { t } = useTranslation()
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
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
              'inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary',
              selected && option !== 'skipped'
                ? 'border-primary bg-primary text-primary-foreground'
                : selected
                  ? 'border-muted bg-accent'
                  : 'border-border bg-surface text-muted hover:bg-accent',
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
