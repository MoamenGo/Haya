import { Link, useSearch } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { MoonStar, NotebookPen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { useDayInfo } from '@/modules/days/hooks'
import { TodayStudy } from '@/modules/learning/components/TodayStudy'
import { useStudyToday } from '@/modules/learning/hooks'
import { remainingStudyMinutes } from '@/modules/learning/sessions'
import { countNotesOn } from '@/modules/notes/repo'
import { getDailyLog } from '@/modules/reviews/repo'
import { useSetting } from '@/modules/settings/hooks'
import { DayNav } from '../components/DayNav'
import { OtherDayHeader } from '../components/OtherDayHeader'
import { PrayerSky } from '../components/PrayerSky'
import { TodayHabits } from '../components/TodayHabits'
import { TodayTasks } from '../components/TodayTasks'
import { isMinimumMode } from '../repo'

/**
 * Today. Phones and portrait tablets read it top to bottom; on landscape
 * tablets and laptops the tasks take the main column and the habits, notes
 * and evening check-in sit beside them.
 *
 * The arrows at the top move to the day before or after (`/today?date=…`,
 * ADR-007). Another day shows the same tasks and study for that date; the
 * prayer sky, notes and evening check-in belong to the real today only.
 */
export function TodayPage() {
  const { t } = useTranslation()
  const [vision] = useSetting('vision')
  const now = useNow()
  const today = localDateISO(now)
  const { date: chosen } = useSearch({ from: '/today' })
  const day = chosen ?? today
  const isToday = day === today
  const isFuture = day > today
  const { dayType, override } = useDayInfo(day)

  const minimumMode = useLiveQuery(() => isMinimumMode(day), [day]) ?? false
  const checkedIn = useLiveQuery(async () => Boolean(await getDailyLog(today)), [today])
  const study = useStudyToday(day)
  const notesToday = useLiveQuery(() => countNotesOn(today), [today]) ?? 0

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <DayNav date={day} today={today} />

      {isToday ? (
        <PrayerSky now={now} dayType={dayType} note={override?.note} />
      ) : (
        <OtherDayHeader date={day} dayType={dayType} note={override?.note} past={!isFuture} />
      )}

      {isToday && vision && (
        <blockquote
          dir="auto"
          className="max-w-prose border-s-2 border-primary ps-4 font-display text-xl leading-relaxed font-light text-foreground"
        >
          {vision}
        </blockquote>
      )}

      <SplitLayout
        spacing="loose"
        aside={
          isToday ? (
            <>
              <TodayHabits today={today} dayType={dayType} minimumMode={minimumMode} />

              <Link
                to="/notes"
                className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-border bg-surface px-5 text-sm font-medium transition-colors hover:border-border-strong hover:bg-subtle"
              >
                <NotebookPen aria-hidden className="size-4 text-primary" />
                {notesToday > 0
                  ? t('notes.todayCount', { count: notesToday })
                  : t('notes.todayLink')}
              </Link>

              <Link
                to="/today/review"
                className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full bg-primary px-7 font-display font-medium text-primary-foreground shadow-[0_10px_24px_-12px_var(--primary)] transition-colors hover:bg-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:self-start lg:self-stretch"
              >
                <MoonStar aria-hidden className="size-5" strokeWidth={1.8} />
                {checkedIn ? t('today.checkInDone') : t('today.checkIn')}
              </Link>
            </>
          ) : isFuture ? undefined : (
            // A past day: habits can still be filled in (a late "I did it").
            <TodayHabits today={day} dayType={dayType} minimumMode={minimumMode} />
          )
        }
      >
        <TodayTasks
          today={day}
          dayType={dayType}
          customMinutes={override?.capacity_min ?? null}
          minimumMode={minimumMode}
          studyMinutes={study ? remainingStudyMinutes(study.sessions) : 0}
        />

        {study && (
          <TodayStudy
            study={study}
            today={day}
            title={isToday ? undefined : t('dayNav.studyThisDay')}
          />
        )}
      </SplitLayout>
    </div>
  )
}
