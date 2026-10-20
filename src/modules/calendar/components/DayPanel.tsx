import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { instantOfISO } from '@/core/time/date'
import { formatGregorian, formatHijri } from '@/core/time/format'
import { TodayStudy } from '@/modules/learning/components/TodayStudy'
import { useStudyToday } from '@/modules/learning/hooks'
import { useSetting } from '@/modules/settings/hooks'
import { TaskItem, TaskList } from '@/modules/tasks/components/TaskItem'
import { createTask } from '@/modules/tasks/repo'
import type { CalendarDay } from '../hooks'

interface DayPanelProps {
  day: CalendarDay
  today: string
}

/**
 * The chosen day under (or beside) the month: its tasks, which can be ticked
 * here, a quick way to add one, and the study the plans give that day.
 */
export function DayPanel({ day, today }: DayPanelProps) {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const study = useStudyToday(day.date)
  const [title, setTitle] = useState('')
  const instant = instantOfISO(day.date)
  const isToday = day.date === today

  async function add(event: FormEvent) {
    event.preventDefault()
    const clean = title.trim()
    if (!clean) return
    await createTask({ title: clean, scheduled_date: day.date })
    setTitle('')
  }

  return (
    <section aria-labelledby="day-title" className="flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="day-title" className="text-xl">
            {formatGregorian(instant, language)}
          </h2>
          <p className="text-sm text-muted">
            {formatHijri(instant, language)} · {t(`dayTypes.${day.dayType}`)}
          </p>
          {day.override?.note && (
            <p dir="auto" className="text-sm text-muted">
              {day.override.note}
            </p>
          )}
        </div>
        <Link
          to="/today"
          search={isToday ? {} : { date: day.date }}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-sm font-medium transition-colors hover:border-border-strong hover:bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
        >
          {isToday ? t('calendar.openToday') : t('calendar.openDay')}
          <ArrowUpRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      </header>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium">{t('calendar.tasks')}</h3>
        {day.tasks.length === 0 ? (
          <p className="text-sm text-muted">{t('calendar.noTasks')}</p>
        ) : (
          <TaskList>
            {day.tasks.map((task) => (
              <TaskItem key={task.id} task={task} todayISO={today} />
            ))}
          </TaskList>
        )}
        <form onSubmit={(e) => void add(e)} className="flex gap-2">
          <label htmlFor="calendar-add" className="sr-only">
            {t('calendar.addLabel')}
          </label>
          <Input
            id="calendar-add"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('calendar.addPlaceholder')}
            className="flex-1"
          />
          <Button type="submit" variant="outline" disabled={!title.trim()}>
            <Plus aria-hidden />
            {t('calendar.add')}
          </Button>
        </form>
      </div>

      {study && (
        <TodayStudy
          study={study}
          today={day.date}
          title={isToday ? undefined : t('dayNav.studyThisDay')}
        />
      )}
    </section>
  )
}
