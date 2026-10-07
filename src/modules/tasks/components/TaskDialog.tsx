import { useLiveQuery } from 'dexie-react-hooks'
import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ChoiceGroup } from '@/components/ui/choice-group'
import { Dialog } from '@/components/ui/dialog'
import { Field, Input, Select, Textarea } from '@/components/ui/input'
import { toast } from '@/components/ui/toast-store'
import type { TaskPriority, TaskRow } from '@/core/db/types'
import { addDaysISO } from '@/core/time/date'
import { listProjects } from '@/modules/projects/repo'
import { createTask, updateTask } from '../repo'

const PRIORITIES: readonly TaskPriority[] = ['low', 'normal', 'important', 'critical']
/** Rough on purpose: estimates are guesses (same choices as the task menu). */
const ESTIMATES = [15, 30, 60, 90] as const
type When = 'today' | 'tomorrow' | 'date' | 'none'

interface TaskDialogProps {
  open: boolean
  onClose: () => void
  todayISO: string
  /** Edit this task; without it the dialog creates a new one. */
  task?: TaskRow | null
}

/**
 * Create or edit a task with all its details. Quick capture stays one line
 * elsewhere; this is for when the owner wants to set date, priority or project.
 * The parent gives it a `key` per task, so the fields start fresh each time.
 */
export function TaskDialog({ open, onClose, todayISO, task }: TaskDialogProps) {
  const { t } = useTranslation()
  const projects = useLiveQuery(listProjects, []) ?? []
  const openProjects = projects.filter((p) => p.project.status !== 'done').map((p) => p.project)

  const [title, setTitle] = useState(task?.title ?? '')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [when, setWhen] = useState<When>(() => initialWhen(task, todayISO))
  const [date, setDate] = useState(task?.scheduled_date ?? addDaysISO(todayISO, 2))
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'normal')
  const [estimate, setEstimate] = useState(task?.est_minutes ? String(task.est_minutes) : '')
  const [projectId, setProjectId] = useState(task?.project_id ?? '')
  const [saving, setSaving] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  const scheduled =
    when === 'today'
      ? todayISO
      : when === 'tomorrow'
        ? addDaysISO(todayISO, 1)
        : when === 'date'
          ? date || null
          : null

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setTitleError(t('taskForm.titleRequired'))
      return
    }
    setSaving(true)
    setFailed(false)
    const fields = {
      title,
      notes,
      scheduled_date: scheduled,
      priority,
      est_minutes: estimate ? Number(estimate) : null,
      project_id: projectId || null,
    }
    try {
      if (task) await updateTask(task, fields)
      else await createTask(fields)
      toast(task ? t('taskForm.saved') : t('taskForm.created'))
      onClose()
    } catch (error) {
      console.error(error) // technical detail stays in the console
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={task ? t('taskForm.editTitle') : t('taskForm.newTitle')}
      description={task ? undefined : t('taskForm.hint')}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field label={t('taskForm.title')} error={titleError}>
          <Input
            autoFocus
            value={title}
            aria-invalid={titleError ? true : undefined}
            placeholder={t('tasks.addPlaceholder')}
            onChange={(e) => {
              setTitle(e.target.value)
              setTitleError(null)
            }}
          />
        </Field>

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium" id="when-label">
            {t('taskForm.when')}
          </span>
          <ChoiceGroup<When>
            label={t('taskForm.when')}
            value={when}
            onChange={setWhen}
            options={[
              { value: 'today', label: t('tasks.toToday') },
              { value: 'tomorrow', label: t('tasks.toTomorrow') },
              { value: 'date', label: t('taskForm.pickDate') },
              { value: 'none', label: t('tasks.toLater') },
            ]}
          />
          {when === 'date' && (
            <Input
              type="date"
              aria-labelledby="when-label"
              value={date}
              min={todayISO}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 sm:w-56"
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">{t('taskForm.priority')}</span>
          <ChoiceGroup<TaskPriority>
            label={t('taskForm.priority')}
            value={priority}
            onChange={setPriority}
            options={PRIORITIES.map((p) => ({ value: p, label: t(`tasks.priorities.${p}`) }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('tasks.estimate')}>
            <Select value={estimate} onChange={(e) => setEstimate(e.target.value)}>
              <option value="">{t('tasks.noEstimate')}</option>
              {ESTIMATES.map((m) => (
                <option key={m} value={m}>
                  {t('duration.m', { m })}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('taskForm.project')}>
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">{t('taskForm.noProject')}</option>
              {openProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label={t('taskForm.notes')}>
          <Textarea
            rows={3}
            value={notes}
            placeholder={t('taskForm.notesPlaceholder')}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        {failed && (
          <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
            {t('states.saveFailed')}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 aria-hidden className="motion-safe:animate-spin" />}
            {task ? t('common.save') : t('taskForm.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

function initialWhen(task: TaskRow | null | undefined, todayISO: string): When {
  if (!task) return 'today'
  if (!task.scheduled_date) return 'none'
  if (task.scheduled_date === todayISO) return 'today'
  if (task.scheduled_date === addDaysISO(todayISO, 1)) return 'tomorrow'
  return 'date'
}
