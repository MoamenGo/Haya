import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarCheck2, CheckCircle2, ListTodo, Plus, Search, SearchX } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input, Select } from '@/components/ui/input'
import { ListSkeleton } from '@/components/ui/skeleton'
import type { TaskRow } from '@/core/db/types'
import { matchesSearch } from '@/core/search/normalize'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { listProjects } from '@/modules/projects/repo'
import { QuickAdd } from '../components/QuickAdd'
import { TaskDialog } from '../components/TaskDialog'
import { TaskItem, TaskList } from '../components/TaskItem'
import { TaskTabs, type TaskView } from '../components/TaskTabs'
import { openTasksExcept, recentlyDone, tasksForDate } from '../repo'
import { sortTasks, type TaskSort } from '../sort'

/** How many finished tasks the "Done" list keeps visible. */
const RECENT_DONE_LIMIT = 30

export function TasksPage() {
  const { t } = useTranslation()
  const today = localDateISO(useNow())
  const todays = useLiveQuery(
    async () => (await tasksForDate(today)).filter((task) => task.status !== 'done'),
    [today],
  )
  const upcoming = useLiveQuery(() => openTasksExcept(today), [today])
  const done = useLiveQuery(() => recentlyDone(RECENT_DONE_LIMIT), [])
  const projects = useLiveQuery(listProjects, [])
  const names = new Map(projects?.map((p) => [p.project.id, p.project.title]))

  const [view, setView] = useState<TaskView>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<TaskSort>('date')
  // `editing` undefined = dialog closed, null = new task, a row = edit it.
  const [editing, setEditing] = useState<TaskRow | null | undefined>(undefined)

  const loading = todays === undefined || upcoming === undefined || done === undefined
  const prepare = (rows: TaskRow[] | undefined) =>
    sortTasks(
      (rows ?? []).filter((task) => matchesSearch(task.title, query)),
      sort,
    )
  const sections = [
    {
      key: 'today',
      title: t('tasks.today'),
      rows: prepare(todays),
      showDate: false,
      icon: CalendarCheck2,
      empty: t('tasks.emptyToday'),
    },
    {
      key: 'upcoming',
      title: t('tasks.upcoming'),
      rows: prepare(upcoming),
      showDate: true,
      icon: ListTodo,
      empty: t('tasks.emptyUpcoming'),
    },
    {
      key: 'done',
      title: t('tasks.done'),
      rows: prepare(done),
      showDate: true,
      icon: CheckCircle2,
      empty: t('tasks.emptyDone'),
    },
  ] as const
  const visible = sections.filter((s) => view === 'all' || view === s.key)
  const nothingAtAll = !loading && todays.length + upcoming.length + done.length === 0
  const noMatches = !loading && query.trim() !== '' && visible.every((s) => s.rows.length === 0)

  const item = (task: TaskRow, showDate: boolean) => (
    <TaskItem
      key={task.id}
      task={task}
      todayISO={today}
      showDate={showDate}
      projectName={task.project_id ? names.get(task.project_id) : undefined}
      onEdit={setEditing}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('tasks.title')}
        intro={t('tasks.subtitle')}
        action={
          <Button onClick={() => setEditing(null)}>
            <Plus aria-hidden />
            {t('taskForm.newTitle')}
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">{t('tasks.search')}</span>
            <Search
              aria-hidden
              className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted"
            />
            <Input
              type="search"
              value={query}
              placeholder={t('tasks.search')}
              onChange={(e) => setQuery(e.target.value)}
              className="ps-9"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="shrink-0">{t('tasks.sortBy')}</span>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as TaskSort)}
              className="sm:w-36"
            >
              <option value="date">{t('tasks.sort.date')}</option>
              <option value="priority">{t('tasks.sort.priority')}</option>
            </Select>
          </label>
        </div>
        <TaskTabs
          value={view}
          onChange={setView}
          counts={{ today: todays?.length, upcoming: upcoming?.length, done: done?.length }}
        />
      </div>

      <QuickAdd todayISO={today} scheduleToday={view !== 'upcoming'} />

      {loading ? (
        <ListSkeleton rows={4} />
      ) : nothingAtAll ? (
        <EmptyState
          icon={ListTodo}
          title={t('tasks.emptyAllTitle')}
          description={t('tasks.emptyAll')}
          action={
            <Button onClick={() => setEditing(null)}>
              <Plus aria-hidden />
              {t('taskForm.newTitle')}
            </Button>
          }
        />
      ) : noMatches ? (
        <EmptyState icon={SearchX} title={t('tasks.noMatches', { query: query.trim() })} />
      ) : (
        <div id="task-panel" role="tabpanel" className="flex flex-col gap-6">
          {visible.map((section) =>
            section.rows.length === 0 && (view === 'all' || query) ? (
              view === 'all' ? null : (
                <EmptyState key={section.key} icon={section.icon} title={section.empty} />
              )
            ) : (
              <section
                key={section.key}
                aria-labelledby={`tasks-${section.key}`}
                className="flex flex-col gap-2"
              >
                <h2
                  id={`tasks-${section.key}`}
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  {section.title}
                  <span className="text-xs font-normal text-muted tabular-nums">
                    {section.rows.length}
                  </span>
                </h2>
                {section.rows.length === 0 ? (
                  <EmptyState icon={section.icon} title={section.empty} />
                ) : (
                  <TaskList>{section.rows.map((task) => item(task, section.showDate))}</TaskList>
                )}
              </section>
            ),
          )}
        </div>
      )}

      {editing !== undefined && (
        <TaskDialog
          key={editing?.id ?? 'new'}
          open
          onClose={() => setEditing(undefined)}
          todayISO={today}
          task={editing}
        />
      )}
    </div>
  )
}
