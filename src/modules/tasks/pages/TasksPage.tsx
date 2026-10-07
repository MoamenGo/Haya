import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { AddTaskForm } from '../components/AddTaskForm'
import { TaskItem } from '../components/TaskItem'
import { openTasksExcept, recentlyDone, tasksForDate } from '../repo'
import { PageHeader } from '@/components/layout/PageHeader'

const RECENT_DONE_LIMIT = 10

export function TasksPage() {
  const { t } = useTranslation()
  const today = localDateISO(useNow())
  const todays = useLiveQuery(
    async () => (await tasksForDate(today)).filter((task) => task.status !== 'done'),
    [today],
  )
  const upcoming = useLiveQuery(() => openTasksExcept(today), [today])
  const done = useLiveQuery(() => recentlyDone(RECENT_DONE_LIMIT), [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('tasks.title')} />
      <AddTaskForm scheduledDate={today} />

      <TaskSection title={t('tasks.today')} empty={t('tasks.emptyToday')}>
        {todays?.map((task) => (
          <TaskItem key={task.id} task={task} todayISO={today} />
        ))}
      </TaskSection>

      <TaskSection title={t('tasks.upcoming')} empty={t('tasks.emptyUpcoming')}>
        {upcoming?.map((task) => (
          <TaskItem key={task.id} task={task} todayISO={today} showDate />
        ))}
      </TaskSection>

      {done && done.length > 0 && (
        <TaskSection title={t('tasks.done')} empty="">
          {done.map((task) => (
            <TaskItem key={task.id} task={task} todayISO={today} showDate />
          ))}
        </TaskSection>
      )}
    </div>
  )
}

function TaskSection({
  title,
  empty,
  children,
}: {
  title: string
  empty: string
  children: React.ReactNode[] | undefined
}) {
  const { t } = useTranslation()
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-medium">{title}</h2>
      {children === undefined ? (
        <p className="text-sm text-muted">{t('states.loading')}</p>
      ) : children.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">{children}</ul>
      )}
    </section>
  )
}
