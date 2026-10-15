import { useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field, Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast-store'
import type { LearningPathRow } from '@/core/db/types'
import { CUSTOM_PLAN } from '@/core/learning/config'
import { baseCurriculum } from '@/core/learning/plan'
import { isBuiltInPlan } from '@/core/learning/types'
import { dayIndexInWeek } from '@/core/learning/week'
import { DAYS_PER_WEEK, addDaysISO, weekStartISO } from '@/core/time/date'
import { createPath, deletePath, updatePath } from '../repo'
import { planInput } from '../schema'

interface PlanDialogProps {
  open: boolean
  onClose: () => void
  todayISO: string
  /** Edit this plan; without it the dialog creates a new one. */
  path?: LearningPathRow
}

/** A new plan starts on the coming Saturday (today, if today is Saturday). */
function nextWeekStart(todayISO: string): string {
  return dayIndexInWeek(todayISO) === 0
    ? todayISO
    : addDaysISO(weekStartISO(todayISO), DAYS_PER_WEEK)
}

/** Create a plan, or change a plan's name, length and start. Custom plans can be deleted. */
export function PlanDialog({ open, onClose, todayISO, path }: PlanDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const builtIn = path ? isBuiltInPlan(path.curriculum_key) : false
  const [title, setTitle] = useState(path?.title ?? '')
  const [weeks, setWeeks] = useState(String(path?.total_weeks ?? CUSTOM_PLAN.defaultWeeks))
  const [start, setStart] = useState(path?.start_date ?? nextWeekStart(todayISO))
  const [titleError, setTitleError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const input = {
    title,
    total_weeks: builtIn ? 1 : Number(weeks),
    start_date: start,
  }
  const valid = planInput.safeParse(input).success

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setTitleError(t('learning.titleRequired'))
      return
    }
    if (!valid) return
    if (path) {
      await updatePath(path, input)
      toast(t('learning.savedPlan'))
      onClose()
      return
    }
    const row = await createPath(input)
    toast(row.status === 'active' ? t('learning.created') : t('learning.createdPaused'))
    onClose()
    void navigate({ to: '/learn/$pathId', params: { pathId: row.id } })
  }

  async function onDelete() {
    if (!path) return
    await deletePath(path)
    toast(t('learning.deleted'))
    onClose()
    void navigate({ to: '/learn' })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={path ? t('learning.editPlan') : t('learning.newPlan')}
      description={path ? undefined : t('learning.newPlanHint')}
    >
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
        <Field label={t('learning.planTitle')} error={titleError}>
          <Input
            value={title}
            aria-invalid={titleError ? true : undefined}
            placeholder={t('learning.planTitlePlaceholder')}
            onChange={(e) => {
              setTitle(e.target.value)
              setTitleError(null)
            }}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          {builtIn && path ? (
            <p className="self-end text-sm text-muted">
              {t('learning.builtInWeeks', {
                count: baseCurriculum(path.curriculum_key, null).totalWeeks,
              })}
            </p>
          ) : (
            <Field label={t('learning.weeks')} hint={t('learning.weeksHint')}>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={CUSTOM_PLAN.maxWeeks}
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
              />
            </Field>
          )}
          <Field label={t('learning.startDate')} hint={t('learning.startDateHint')}>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
        </div>

        {confirming && (
          <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
            {t('learning.deleteConfirm')}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {path && !builtIn ? (
            <Button
              variant="danger"
              onClick={() => (confirming ? void onDelete() : setConfirming(true))}
            >
              {confirming ? t('learning.deleteForGood') : t('learning.deletePlan')}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!valid && Boolean(title.trim())}>
              {path ? t('common.save') : t('learning.newPlan')}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
