import { cn } from '@/lib/utils'

interface ChoiceGroupProps<T extends string> {
  label: string
  value: T
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (value: T) => void
  className?: string
}

/** Track and item classes shared by every segmented control in the app. */
export const segmentTrack = 'flex w-fit max-w-full flex-wrap gap-0.5 rounded-lg bg-subtle p-0.5'
export const segmentItem =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-3 text-sm whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring md:min-h-9'
export const segmentOn = 'bg-surface font-medium text-foreground shadow-card ring-1 ring-border'
export const segmentOff = 'text-muted hover:text-foreground'

/** A row of mutually exclusive buttons, announced as a radio group to screen readers. */
export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: ChoiceGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn(segmentTrack, className)}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(segmentItem, selected ? segmentOn : segmentOff)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
