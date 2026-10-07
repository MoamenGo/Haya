import { useTranslation } from 'react-i18next'
import { segmentItem, segmentOff, segmentOn, segmentTrack } from '@/components/ui/choice-group'
import { cn } from '@/lib/utils'

export type TaskView = 'all' | 'today' | 'upcoming' | 'done'
const VIEWS: readonly TaskView[] = ['all', 'today', 'upcoming', 'done']

interface TaskTabsProps {
  value: TaskView
  onChange: (view: TaskView) => void
  counts: Partial<Record<Exclude<TaskView, 'all'>, number>>
}

/** Filter tabs over the task list. Arrow keys move between tabs (WAI-ARIA tabs pattern). */
export function TaskTabs({ value, onChange, counts }: TaskTabsProps) {
  const { t, i18n } = useTranslation()

  function onKeyDown(event: React.KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (!step) return
    // In Arabic the next tab is to the left.
    const direction = i18n.dir() === 'rtl' ? -step : step
    const next = VIEWS[(VIEWS.indexOf(value) + direction + VIEWS.length) % VIEWS.length]!
    onChange(next)
    document.getElementById(`tab-${next}`)?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={t('tasks.views')}
      onKeyDown={onKeyDown}
      className={cn(segmentTrack, 'w-full sm:w-fit')}
    >
      {VIEWS.map((view) => {
        const selected = view === value
        const count = view === 'all' ? undefined : counts[view]
        return (
          <button
            key={view}
            id={`tab-${view}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="task-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(view)}
            className={cn(segmentItem, 'flex-1 sm:flex-none', selected ? segmentOn : segmentOff)}
          >
            {t(`tasks.views_.${view}`)}
            {count !== undefined && (
              <span className="text-xs text-muted tabular-nums">{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
