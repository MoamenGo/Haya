import { useLiveQuery } from 'dexie-react-hooks'
import { useState, type FormEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TaskRow } from '@/core/db/types'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { cn } from '@/lib/utils'
import { TaskActions } from '@/modules/tasks/components/TaskActions'
import { renameTask, setTaskDone } from '@/modules/tasks/repo'
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
    <details open={open} className="group rounded-lg border border-border bg-subtle/50 px-3 py-1.5">
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
  const [editing, setEditing] = useState(false)
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
          'flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring',
          done
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border-strong bg-surface hover:border-primary',
        )}
      >
        {done && <Check aria-hidden className="size-3 animate-pop" />}
      </button>
      {editing ? (
        <RenameStep step={step} onDone={() => setEditing(false)} />
      ) : (
        <div className="min-w-0 flex-1 text-sm">
          <button
            type="button"
            dir="auto"
            title={t('projects.renameStep')}
            onClick={() => setEditing(true)}
            className={cn(
              'w-full break-words text-start hover:text-primary',
              done && 'text-muted line-through',
            )}
          >
            {step.title}
          </button>
          {(when || step.est_minutes !== null) && (
            <p className="flex gap-2 text-xs text-muted">
              {when && <span>{when}</span>}
              {step.est_minutes !== null && <span>{t('duration.m', { m: step.est_minutes })}</span>}
            </p>
          )}
        </div>
      )}
      {!done && !editing && <TaskActions task={step} todayISO={todayISO} />}
    </li>
  )
}

/** Inline rename: Enter saves, Escape or an empty name cancels. */
function RenameStep({ step, onDone }: { step: TaskRow; onDone: () => void }) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(step.title)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (title.trim() && title.trim() !== step.title) await renameTask(step.id, title)
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-1 gap-2">
      <Input
        autoFocus
        aria-label={t('projects.renameStep')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onDone()}
        className="min-w-0 flex-1 text-sm"
      />
      <Button type="submit" variant="outline">
        {t('common.save')}
      </Button>
    </form>
  )
}
