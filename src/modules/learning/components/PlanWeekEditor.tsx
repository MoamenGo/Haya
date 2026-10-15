import { Copy, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast-store'
import type { LearningPathRow } from '@/core/db/types'
import type { EditableStep } from '@/core/learning/edits'
import { isBuiltInPlan } from '@/core/learning/types'
import { usePlanWeek } from '../hooks'
import { copyWeekSteps } from '../repo'
import { PlanDay } from './PlanDay'
import { StepDialog } from './StepDialog'

interface PlanWeekEditorProps {
  path: LearningPathRow
  week: number
  todayISO: string
}

/** Where the dialog is open: a day to add to, and the step being edited (if any). */
interface Editing {
  day: number
  step?: EditableStep
  /** Fresh key per opening, so the form starts from this step's values. */
  key: number
}

/** Every day of one plan week, editable: add, change, hide or bring back steps. */
export function PlanWeekEditor({ path, week, todayISO }: PlanWeekEditorProps) {
  const { t } = useTranslation()
  const data = usePlanWeek(path, week)
  const [showHidden, setShowHidden] = useState(false)
  const [editing, setEditing] = useState<Editing | null>(null)

  if (!data) return <ListSkeleton rows={3} />

  const all = data.days.flat()
  const hiddenCount = all.filter((s) => s.hidden).length
  const minutes = all.filter((s) => !s.hidden).reduce((sum, s) => sum + s.item.minutes, 0)
  const empty = all.length === 0

  async function copyLastWeek() {
    const count = await copyWeekSteps(path.id, week - 1, week)
    toast(t('learning.copied', { count }))
  }

  return (
    <section aria-labelledby="week-steps" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="week-steps" className="text-xl font-medium">
            {t('learning.weekPlan')}
          </h2>
          {minutes > 0 && (
            <p className="text-sm text-muted">{t('learning.weekTotal', { m: minutes })}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {hiddenCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowHidden(!showHidden)}>
              {showHidden ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              {showHidden ? t('learning.hideHidden') : t('learning.hidden', { count: hiddenCount })}
            </Button>
          )}
          {week > 1 && (
            <Button variant="ghost" size="sm" onClick={() => void copyLastWeek()}>
              <Copy aria-hidden />
              {t('learning.copyWeek')}
            </Button>
          )}
        </div>
      </div>

      {empty && !isBuiltInPlan(path.curriculum_key) && (
        <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted">
          {t('learning.customEmpty')}
        </p>
      )}

      <div className="flex flex-col gap-6">
        {data.days.map((steps, day) => (
          <PlanDay
            key={data.dates[day]}
            pathId={path.id}
            date={data.dates[day] ?? ''}
            dayType={data.dayTypes[day] ?? 'custom'}
            steps={steps}
            showHidden={showHidden}
            done={data.done}
            todayISO={todayISO}
            onAdd={() => setEditing({ day, key: Date.now() })}
            onEdit={(step) => setEditing({ day, step, key: Date.now() })}
          />
        ))}
      </div>

      {editing && (
        <StepDialog
          key={editing.key}
          open
          onClose={() => setEditing(null)}
          pathId={path.id}
          week={week}
          day={editing.day}
          step={editing.step}
        />
      )}
    </section>
  )
}
