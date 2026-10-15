import { Eye, Pencil, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { EditableStep } from '@/core/learning/edits'
import type { DayType } from '@/core/time/config'
import { instantOfISO } from '@/core/time/date'
import { formatDayHeading } from '@/core/time/format'
import { cn } from '@/lib/utils'
import { useSetting } from '@/modules/settings/hooks'
import { TaskList } from '@/modules/tasks/components/TaskItem'
import { showStep } from '../repo'
import { StudyItemRow } from './StudyItemRow'

interface PlanDayProps {
  pathId: string
  date: string
  dayType: DayType
  steps: EditableStep[]
  showHidden: boolean
  done: ReadonlySet<string>
  todayISO: string
  onAdd: () => void
  onEdit: (step: EditableStep) => void
}

/** One day of a plan week in the editor: its steps, their minutes, and "add a step". */
export function PlanDay(props: PlanDayProps) {
  const { pathId, date, dayType, steps, showHidden, done, todayISO, onAdd, onEdit } = props
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const visible = steps.filter((s) => showHidden || !s.hidden)
  const minutes = steps.filter((s) => !s.hidden).reduce((sum, s) => sum + s.item.minutes, 0)
  const isToday = date === todayISO

  return (
    <section
      aria-label={formatDayHeading(instantOfISO(date), language)}
      className={cn('flex flex-col gap-2', isToday && 'rounded-2xl bg-accent/50 p-2 -m-2')}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {formatDayHeading(instantOfISO(date), language)}
          {isToday && <Badge tone="accent">{t('week.today')}</Badge>}
          <span className="text-xs font-normal text-muted">{t(`dayTypes.${dayType}`)}</span>
        </h3>
        {minutes > 0 && (
          <span className="text-xs text-muted tabular-nums">{t('duration.m', { m: minutes })}</span>
        )}
      </div>

      {visible.length > 0 ? (
        <TaskList>
          {visible.map((step) => {
            const hiddenOriginal = step.hidden ? step.original : null
            return (
              <StudyItemRow
                key={step.item.key}
                item={step.item}
                pathId={pathId}
                done={done.has(step.item.key)}
                todayISO={todayISO}
                muted={step.hidden}
                badges={<StepBadges step={step} />}
                actions={
                  hiddenOriginal ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void showStep(pathId, hiddenOriginal)}
                    >
                      <Eye aria-hidden />
                      {t('learning.show')}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('learning.stepActions', { title: step.item.text })}
                      onClick={() => onEdit(step)}
                    >
                      <Pencil aria-hidden />
                    </Button>
                  )
                }
              />
            )
          })}
        </TaskList>
      ) : (
        <p className="px-1 text-xs text-muted">{t('learning.dayEmpty')}</p>
      )}

      <Button variant="ghost" size="sm" className="self-start text-primary" onClick={onAdd}>
        <Plus aria-hidden />
        {t('learning.addStep')}
      </Button>
    </section>
  )
}

function StepBadges({ step }: { step: EditableStep }) {
  const { t } = useTranslation()
  if (step.hidden) return <Badge>{t('learning.hiddenLabel')}</Badge>
  return (
    <>
      <span>{t(`learning.kinds.${step.item.kind}`)}</span>
      {!step.original && <Badge tone="accent">{t('learning.yours')}</Badge>}
      {step.original && step.edited && <Badge tone="accent">{t('learning.edited')}</Badge>}
    </>
  )
}
