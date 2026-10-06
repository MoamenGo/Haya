import { cn } from '@/lib/utils'

interface ChoiceGroupProps<T extends string> {
  label: string
  value: T
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (value: T) => void
}

/** A row of mutually exclusive buttons, announced as a radio group to screen readers. */
export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: ChoiceGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-11 rounded-lg border px-4 text-sm focus-visible:outline-2 focus-visible:outline-primary',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-surface hover:bg-accent',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
