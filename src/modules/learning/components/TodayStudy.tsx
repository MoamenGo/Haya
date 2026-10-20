import { useTranslation } from 'react-i18next'
import { instantOfISO } from '@/core/time/date'
import { formatDayMonth } from '@/core/time/format'
import { TaskList } from '@/modules/tasks/components/TaskItem'
import { useSetting } from '@/modules/settings/hooks'
import type { StudyToday } from '../hooks'
import { remainingStudyMinutes } from '../sessions'
import { PlansLink } from './PlansLink'
import { StudyItemRow } from './StudyItemRow'

interface TodayStudyProps {
  study: StudyToday
  today: string
  /** Heading when the day shown is not today ("Study this day"). */
  title?: string
}

/** Today's study from every active plan, sized to the day type (CLAUDE.md §6.6). */
export function TodayStudy({ study, today, title }: TodayStudyProps) {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const { sessions, nextStart, activePlans } = study
  // Nothing to study today: still offer the way to the plans.
  if (sessions.length === 0 && !nextStart) return <PlansLink activePlans={activePlans} />
  const remaining = remainingStudyMinutes(sessions)

  return (
    <section aria-labelledby="study-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="study-title" className="text-xl font-medium">
          {title ?? t('today.study')}
        </h2>
        {remaining > 0 && (
          <span className="text-sm text-muted">{t('today.studyLeft', { m: remaining })}</span>
        )}
      </div>

      {sessions.length === 0 && nextStart && (
        <p className="text-sm text-muted">
          {t('today.studyStarts', { date: formatDayMonth(instantOfISO(nextStart), language) })}
        </p>
      )}

      {sessions.map(({ path, curriculum, day, done }) => {
        const { phase } = curriculum.overview(day.week)
        return (
          <div key={path.id} className="flex flex-col gap-2">
            <h3 className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <span dir="auto" className="font-medium">
                {path.title}
              </span>
              <span dir="auto" className="text-muted">
                {t('learning.weekOf', { week: day.week })}
                {phase && ` · ${phase}`}
              </span>
            </h3>
            <TaskList>
              {day.items.map((item) => (
                <StudyItemRow
                  key={item.key}
                  item={item}
                  pathId={path.id}
                  done={done.has(item.key)}
                  todayISO={today}
                />
              ))}
            </TaskList>
          </div>
        )
      })}

      <PlansLink activePlans={activePlans} />
    </section>
  )
}
