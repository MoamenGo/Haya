import { Check, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TaskRow } from '@/core/db/types'
import { cn } from '@/lib/utils'
import { setTaskDone } from '../repo'
import { TaskActions } from './TaskActions'

interface TaskItemProps {
  task: TaskRow
  todayISO: string
  /** Shows the date when listing tasks from several days. */
  showDate?: boolean
}

export function TaskItem({ task, todayISO, showDate = false }: TaskItemProps) {
  const { t } = useTranslation()
  const done = task.status === 'done'
  const overdue = !done && task.scheduled_date !== null && task.scheduled_date < todayISO

  return (
    <li className="flex items-start gap-3 rounded-2xl border border-border/80 bg-surface p-3 shadow-card transition-colors sm:p-4">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={t('tasks.markDone', { title: task.title })}
        onClick={() => void setTaskDone(task, !done)}
        className={cn(
          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 focus-visible:outline-2 focus-visible:outline-primary',
          done
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border hover:border-primary/60',
        )}
      >
        {done && <Check aria-hidden className="size-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <p dir="auto" className={cn('break-words', done && 'text-muted line-through')}>
          {task.is_big_rock && (
            <Star aria-hidden className="me-1 inline size-4 fill-current text-gold" />
          )}
          {task.title}
        </p>
        <p className="mt-0.5 flex gap-2 text-xs text-muted">
          {showDate && task.scheduled_date && (
            <span>
              {overdue ? `${t('tasks.overdue')} · ` : ''}
              {task.scheduled_date}
            </span>
          )}
          {task.est_minutes !== null && <span>{t('duration.m', { m: task.est_minutes })}</span>}
        </p>
      </div>
      {!done && <TaskActions task={task} todayISO={todayISO} />}
    </li>
  )
}
