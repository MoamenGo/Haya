import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { canAddBigRock, dayCapacity } from '@/core/planner/capacity'
import type { DayType } from '@/core/time/config'
import { addDaysISO } from '@/core/time/date'
import { cn } from '@/lib/utils'
import { getDailyLog } from '@/modules/reviews/repo'
import { TaskItem } from '@/modules/tasks/components/TaskItem'
import { countBigRocks, createTask, tasksForDate } from '@/modules/tasks/repo'

const PERCENT = 100

/** Big Rocks, the rest of today's tasks, and a calm capacity bar (CLAUDE.md §6.6). */
interface TodayTasksProps {
  today: string
  dayType: DayType
  /** Free minutes the owner set for this date, if any. */
  customMinutes: number | null
  /** Hard-day mode shows only non-negotiable (L1) tasks (CLAUDE.md §4.5). */
  minimumMode: boolean
}

export function TodayTasks({ today, dayType, customMinutes, minimumMode }: TodayTasksProps) {
  const { t } = useTranslation()
  const allTasks = useLiveQuery(() => tasksForDate(today), [today])
  const lastNight = useLiveQuery(() => getDailyLog(addDaysISO(today, -1)), [today])
  if (!allTasks) return null
  const tasks = minimumMode ? allTasks.filter((task) => task.commitment_level === 1) : allTasks
  if (minimumMode && tasks.length === 0) return null

  const rocks = tasks.filter((task) => task.is_big_rock)
  const others = tasks.filter((task) => !task.is_big_rock)
  const planned = tasks
    .filter((task) => task.status !== 'done')
    .reduce((sum, task) => sum + (task.est_minutes ?? 0), 0)
  const capacity = dayCapacity(dayType, planned, { customMinutes })
  const titles = new Set(allTasks.map((task) => task.title))
  const suggestion = lastNight?.tomorrow_top3.find((item) => !titles.has(item))

  async function adoptSuggestion(title: string) {
    const roomForRock = canAddBigRock(await countBigRocks(today))
    await createTask({ title, scheduled_date: today, is_big_rock: roomForRock })
  }

  return (
    <section aria-labelledby="rocks-title" className="flex flex-col gap-3">
      <h2 id="rocks-title" className="text-lg font-semibold">
        {t('today.bigRocks')}
      </h2>

      {suggestion && !minimumMode && (
        <div className="flex flex-col gap-2 rounded-2xl border-s-4 border-gold bg-gold-soft/60 p-4 text-sm">
          <p>
            {t('today.fromLastNight')} <strong dir="auto">{suggestion}</strong>
          </p>
          <div>
            <Button onClick={() => void adoptSuggestion(suggestion)}>
              {t('today.makeBigRock')}
            </Button>
          </div>
        </div>
      )}

      {rocks.length === 0 ? (
        <p className="text-sm text-muted">{t('today.bigRocksEmpty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rocks.map((task) => (
            <TaskItem key={task.id} task={task} todayISO={today} />
          ))}
        </ul>
      )}

      {others.length > 0 && (
        <>
          <h3 className="mt-2 text-sm font-medium text-muted">{t('today.otherTasks')}</h3>
          <ul className="flex flex-col gap-2">
            {others.map((task) => (
              <TaskItem key={task.id} task={task} todayISO={today} />
            ))}
          </ul>
        </>
      )}

      {planned > 0 && (
        <div className="flex flex-col gap-1 text-sm">
          <p className="text-muted">
            {t('today.capacity', { planned: capacity.planned, plannable: capacity.plannable })}
          </p>
          <div className="h-2.5 overflow-hidden rounded-full bg-accent" aria-hidden>
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-500',
                capacity.over ? 'bg-gold' : 'bg-primary',
              )}
              style={{
                width: `${Math.min(PERCENT, (capacity.planned / capacity.plannable) * PERCENT)}%`,
              }}
            />
          </div>
          {capacity.over && <p>{t('today.capacityOver')}</p>}
        </div>
      )}
    </section>
  )
}
