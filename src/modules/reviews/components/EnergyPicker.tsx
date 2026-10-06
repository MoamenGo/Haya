import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { ENERGY_MAX, ENERGY_MIN } from '../schema'

const LEVELS = Array.from({ length: ENERGY_MAX - ENERGY_MIN + 1 }, (_, i) => ENERGY_MIN + i)

interface EnergyPickerProps {
  value: number | null
  onChange: (value: number | null) => void
}

export function EnergyPicker({ value, onChange }: EnergyPickerProps) {
  const { t } = useTranslation()
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-medium">{t('review.energy')}</legend>
      <p id="energy-hint" className="text-sm text-muted">
        {t('review.energyHint')}
      </p>
      <div role="radiogroup" aria-describedby="energy-hint" className="flex gap-2">
        {LEVELS.map((level) => {
          const selected = value === level
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={String(level)}
              onClick={() => onChange(selected ? null : level)}
              className={cn(
                'size-12 rounded-full border text-base focus-visible:outline-2 focus-visible:outline-primary',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface hover:bg-accent',
              )}
            >
              {level}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
