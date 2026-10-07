import { Check, Clock, Folder, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { TaskRow } from '@/core/db/types'
import { addDaysISO } from '@/core/time/date'
import { cn } from '@/lib/utils'
import { setTaskDone } from '../repo'
import { TaskActions } from './TaskActions'

interface TaskItemProps {
  task: TaskRow
  todayISO: string
  /** Shows the date when listing tasks from several days. */
  showDate?: boolean
  /** The project's name, shown in the meta line when known. */
  projectName?: string
  /** Opens the edit dialog (the Tasks page passes it; Today doesn't need it). */
  onEdit?: (task: TaskRow) => void
}

const PRIORITY_TONE = { critical: 'danger', important: 'warning', low: 'neutral' } as const

/** One task as a light row: checkbox, title, and a quiet meta line. */
export function TaskItem({ task, todayISO, showDate = false, projectName, onEdit }: TaskItemProps) {
  const { t } = useTranslation()
  const done = task.status === 'done'
  const overdue = !done && task.scheduled_date !== null && task.scheduled_date < todayISO
  const when = !showDate || !task.scheduled_date ? null : dayLabel(task.scheduled_date, todayISO, t)
  const priority = task.priority === 'normal' ? null : task.priority

  return (
    <li className="group flex items-start gap-3 px-3 py-3 transition-colors hover:bg-subtle/60 sm:px-4">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={t('tasks.markDone', { title: task.title })}
        onClick={() => void setTaskDone(task, !done)}
        className={cn(
          // 44px tap area around a 20px circle.
          '-m-3 flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:-outline-offset-8 focus-visible:outline-ring',
        )}
      >
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded-full border-[1.5px] transition-colors duration-150',
            done
              ? 'border-primary bg-primary text-primary-foreground'
              : priority === 'critical'
                ? 'border-danger/70 hover:bg-danger-soft'
                : 'border-border-strong hover:border-primary hover:bg-accent',
          )}
        >
          {done && <Check aria-hidden className="size-3 animate-pop" strokeWidth={3} />}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <p
          dir="auto"
          className={cn(
            'text-sm break-words transition-colors duration-200 md:text-[0.9375rem]',
            done && 'text-muted line-through decoration-muted/60',
          )}
        >
          {task.is_big_rock && (
            <Star
              aria-label={t('today.bigRocks')}
              className="me-1.5 -mt-0.5 inline size-3.5 fill-primary text-primary"
            />
          )}
          {task.title}
        </p>
        <MetaLine>
          {when && (
            <Badge tone={overdue ? 'warning' : 'neutral'}>
              {overdue ? `${t('tasks.overdue')} · ${when}` : when}
            </Badge>
          )}
          {priority && !done && (
            <Badge tone={PRIORITY_TONE[priority]}>{t(`tasks.priorities.${priority}`)}</Badge>
          )}
          {projectName && (
            <span className="inline-flex items-center gap-1">
              <Folder aria-hidden className="size-3" />
              <span dir="auto" className="max-w-40 truncate">
                {projectName}
              </span>
            </span>
          )}
          {task.est_minutes !== null && (
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden className="size-3" />
              {t('duration.m', { m: task.est_minutes })}
            </span>
          )}
        </MetaLine>
      </div>
      {!done && <TaskActions task={task} todayISO={todayISO} onEdit={onEdit} />}
    </li>
  )
}

function MetaLine({ children }: { children: React.ReactNode[] }) {
  if (!children.some(Boolean)) return null
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
      {children}
    </div>
  )
}

/** "Today", "Tomorrow", "Yesterday", or the date itself. */
function dayLabel(
  dateISO: string,
  todayISO: string,
  t: (key: 'tasks.toToday' | 'tasks.toTomorrow' | 'tasks.yesterday') => string,
) {
  if (dateISO === todayISO) return t('tasks.toToday')
  if (dateISO === addDaysISO(todayISO, 1)) return t('tasks.toTomorrow')
  if (dateISO === addDaysISO(todayISO, -1)) return t('tasks.yesterday')
  return dateISO
}

/** The panel every task list sits in: one bordered surface with hairline rows. */
export function TaskList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ul
      className={cn(
        'flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface',
        className,
      )}
    >
      {children}
    </ul>
  )
}
