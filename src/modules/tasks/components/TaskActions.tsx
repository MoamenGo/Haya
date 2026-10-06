import { MoreHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TaskRow } from '@/core/db/types'
import { addDaysISO } from '@/core/time/date'
import { BigRockLimitError, deleteTask, scheduleTask, setBigRock, setEstimate } from '../repo'

/** Estimate choices in minutes. Rough on purpose: estimates are guesses. */
const ESTIMATES = [15, 30, 60, 90] as const

const itemClass = 'min-h-10 rounded-lg px-3 text-start text-sm hover:bg-accent'

/** A small menu of one-tap actions, built on <details> so it needs no JavaScript library. */
export function TaskActions({ task, todayISO }: { task: TaskRow; todayISO: string }) {
  const { t } = useTranslation()
  const [message, setMessage] = useState<string | null>(null)
  const menu = useRef<HTMLDetailsElement>(null)
  const isToday = task.scheduled_date === todayISO

  // Close the menu when tapping anywhere outside it.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (menu.current?.open && !menu.current.contains(event.target as Node)) {
        menu.current.open = false
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  /** Runs an action, then closes the menu so it never covers the next task. */
  function run(action: () => Promise<void>) {
    return () => {
      if (menu.current) menu.current.open = false
      void action()
    }
  }

  async function toggleRock() {
    try {
      await setBigRock(task, todayISO, !(task.is_big_rock && isToday))
      setMessage(null)
      if (menu.current) menu.current.open = false
    } catch (error) {
      if (error instanceof BigRockLimitError) setMessage(t('tasks.bigRockFull'))
      else throw error
    }
  }

  return (
    <details ref={menu} className="relative">
      <summary
        aria-label={t('tasks.actions', { title: task.title })}
        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg text-muted hover:bg-accent"
      >
        <MoreHorizontal aria-hidden className="size-5" />
      </summary>
      <div className="absolute end-0 z-10 mt-1 flex w-52 flex-col rounded-xl border border-border bg-surface p-1 shadow-lg">
        <button type="button" className={itemClass} onClick={() => void toggleRock()}>
          {task.is_big_rock && isToday ? t('tasks.unBigRock') : t('tasks.bigRock')}
        </button>
        {message && <p className="px-3 py-1 text-xs text-muted">{message}</p>}
        {!isToday && (
          <button
            type="button"
            className={itemClass}
            onClick={run(() => scheduleTask(task, todayISO))}
          >
            {t('tasks.toToday')}
          </button>
        )}
        <button
          type="button"
          className={itemClass}
          onClick={run(() => scheduleTask(task, addDaysISO(todayISO, 1)))}
        >
          {t('tasks.toTomorrow')}
        </button>
        {task.scheduled_date !== null && (
          <button type="button" className={itemClass} onClick={run(() => scheduleTask(task, null))}>
            {t('tasks.toLater')}
          </button>
        )}
        <p className="px-3 pt-2 text-xs text-muted">{t('tasks.estimate')}</p>
        <div className="flex flex-wrap gap-1 px-2 pb-1">
          {ESTIMATES.map((minutes) => (
            <button
              key={minutes}
              type="button"
              aria-pressed={task.est_minutes === minutes}
              onClick={run(() =>
                setEstimate(task.id, task.est_minutes === minutes ? null : minutes),
              )}
              className="min-h-9 rounded-md border border-border px-2 text-xs aria-pressed:border-primary aria-pressed:bg-accent"
            >
              {minutes}
            </button>
          ))}
        </div>
        <button type="button" className={itemClass} onClick={run(() => deleteTask(task.id))}>
          {t('tasks.delete')}
        </button>
      </div>
    </details>
  )
}
