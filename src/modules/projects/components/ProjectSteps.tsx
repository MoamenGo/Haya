import { useLiveQuery } from 'dexie-react-hooks'
import { Check, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TaskRow } from '@/core/db/types'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { cn } from '@/lib/utils'
import { TaskActions } from '@/modules/tasks/components/TaskActions'
import { setTaskDone } from '@/modules/tasks/repo'
import { stepsForProject } from '../repo'
import { AddStepForm } from './AddStepForm'

interface ProjectStepsProps {
  projectId: string
  /** Active projects show their steps open; the others keep them folded. */
  open: boolean
}

/**
 * A project broken into small steps (tasks with this `project_id`).
 * Built on <details>, so a long list of plans stays short until opened.
 */
export function ProjectSteps({ projectId, open }: ProjectStepsProps) {
  const { t } = useTranslation()
  const today = localDateISO(useNow())
  const steps = useLiveQuery(() => stepsForProject(projectId), [projectId])
  if (steps === undefined) return null
  const done = steps.filter((s) => s.status === 'done').length

  return (
    <details open={open} className="group rounded-xl bg-background p-3">
      <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 text-sm">
        <ChevronDown
          aria-hidden
          className="size-4 text-muted transition-transform group-open:rotate-180"
        />
        <span className="flex-1 font-medium">{t('projects.steps')}</span>
        <span className="text-xs text-muted">
          {steps.length === 0
            ? t('projects.noSteps')
            : t('projects.stepsDone', { done, total: steps.length })}
        </span>
      </summary>
      {steps.length > 0 && (
        <ul className="mt-2 flex flex-col divide-y divide-border">
          {steps.map((step) => (
            <StepItem key={step.id} step={step} todayISO={today} />
          ))}
        </ul>
      )}
      <AddStepForm projectId={projectId} />
    </details>
  )
}

function StepItem({ step, todayISO }: { step: TaskRow; todayISO: string }) {
  const { t } = useTranslation()
  const done = step.status === 'done'
  const when =
    step.scheduled_date === todayISO
      ? t('projects.stepToday')
      : step.scheduled_date
        ? step.scheduled_date
        : null

  return (
    <li className="flex items-center gap-3 py-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={t('tasks.markDone', { title: step.title })}
        onClick={() => void setTaskDone(step, !done)}
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full border-2 focus-visible:outline-2 focus-visible:outline-primary',
          done
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-surface hover:border-primary/60',
        )}
      >
        {done && <Check aria-hidden className="size-3.5" />}
      </button>
      <div className="min-w-0 flex-1 text-sm">
        <p dir="auto" className={cn('break-words', done && 'text-muted line-through')}>
          {step.title}
        </p>
        {(when || step.est_minutes !== null) && (
          <p className="flex gap-2 text-xs text-muted">
            {when && <span>{when}</span>}
            {step.est_minutes !== null && <span>{t('duration.m', { m: step.est_minutes })}</span>}
          </p>
        )}
      </div>
      {!done && <TaskActions task={step} todayISO={todayISO} />}
    </li>
  )
}
