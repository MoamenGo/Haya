import type { NotifyDay } from '@/core/notify/plan'
import { addDaysISO } from '@/core/time/date'
import { prayersForDate, type Location } from '@/core/time/prayers'
import { remainingStudyMinutes, studyWeek, type PathSession } from '@/modules/learning/sessions'
import { openProjectsDueBetween } from '@/modules/projects/repo'
import { openTasksDueBetween, tasksBetween } from '@/modules/tasks/repo'
import { minimumModeDates } from '@/modules/today/repo'

/**
 * Reads what the notification planner needs for `count` days from `fromISO`.
 * It only composes the other modules' repos; it writes nothing.
 */
export async function notifyDays(
  fromISO: string,
  count: number,
  location: Location,
): Promise<NotifyDay[]> {
  const dates = Array.from({ length: count }, (_, i) => addDaysISO(fromISO, i))
  const lastISO = dates[dates.length - 1] ?? fromISO
  const minimum = await minimumModeDates(fromISO, lastISO)
  const [scheduled, dueTasks, dueProjects, study] = await Promise.all([
    tasksBetween(fromISO, lastISO),
    openTasksDueBetween(fromISO, lastISO),
    openProjectsDueBetween(fromISO, lastISO),
    studyFor(dates, minimum),
  ])

  return dates.map((date) => {
    const open = scheduled.filter((t) => t.scheduled_date === date && t.status !== 'done')
    return {
      date,
      prayers: prayersForDate(date, location),
      openTasks: open.length,
      bigRocks: open.filter((t) => t.is_big_rock).map((t) => t.title),
      studyMinutes: remainingStudyMinutes(study.get(date) ?? []),
      due: [
        ...dueTasks.filter((t) => t.due_date === date).map((t) => t.title),
        ...dueProjects.filter((p) => p.deadline === date).map((p) => p.title),
      ],
    }
  })
}

/** Study sessions for the dates, which may cross from one app week into the next. */
async function studyFor(
  dates: readonly string[],
  minimum: ReadonlySet<string>,
): Promise<Map<string, PathSession[]>> {
  const result = new Map<string, PathSession[]>()
  for (const date of dates) {
    if (result.has(date)) continue
    for (const [d, sessions] of await studyWeek(date, minimum)) result.set(d, sessions)
  }
  return result
}
