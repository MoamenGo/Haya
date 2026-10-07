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
    <div
      role="radiogroup"
      aria-label={label}
      className="flex w-fit max-w-full flex-wrap gap-1 rounded-full bg-background p-1"
    >
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
              'min-h-10 rounded-full px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring',
              selected
                ? 'bg-primary font-medium text-primary-foreground'
                : 'text-muted hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
