import { getRouteApi, Link } from '@tanstack/react-router'
import { ArrowLeft, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ListSkeleton } from '@/components/ui/skeleton'
import { baseCurriculum } from '@/core/learning/plan'
import { isBuiltInPlan } from '@/core/learning/types'
import { planWeekDates } from '@/core/learning/week'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { PathStatusButtons } from '../components/PathStatusButtons'
import { PlanDialog } from '../components/PlanDialog'
import { PlanStats } from '../components/PlanStats'
import { PlanWeekEditor } from '../components/PlanWeekEditor'
import { WeekNav } from '../components/WeekNav'
import { WeekOverview } from '../components/WeekOverview'
import { usePathSummary, type PathSummary } from '../hooks'

const route = getRouteApi('/learn/$pathId')

/** One plan, week by week, with every step editable (CLAUDE.md §6.10). */
export function PlanPage() {
  const { t } = useTranslation()
  const { pathId } = route.useParams()
  const today = localDateISO(useNow())
  const summary = usePathSummary(pathId, today)

  const back = (
    <Link
      to="/learn"
      className="inline-flex items-center gap-1 self-start text-sm text-primary underline-offset-4 hover:underline"
    >
      {/* "Back" points to the start of the line: right in Arabic. */}
      <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
      {t('learning.back')}
    </Link>
  )

  if (summary === undefined) return <ListSkeleton rows={3} />
  if (summary === null) {
    return (
      <div className="flex flex-col gap-3">
        {back}
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
          {t('learning.missing')}
        </p>
      </div>
    )
  }
  return <PlanView key={summary.path.id} summary={summary} today={today} back={back} />
}

function PlanView({
  summary,
  today,
  back,
}: {
  summary: PathSummary
  today: string
  back: React.ReactNode
}) {
  const { t } = useTranslation()
  const { path, totalWeeks } = summary
  const currentWeek = summary.week >= 1 && summary.week <= totalWeeks ? summary.week : null
  const [week, setWeek] = useState(Math.min(Math.max(summary.week, 1), totalWeeks))
  const [settingsKey, setSettingsKey] = useState<number | null>(null)
  const shownWeek = Math.min(week, totalWeeks)
  const dates = planWeekDates(path.start_date, shownWeek)
  const overview = baseCurriculum(path.curriculum_key, path.total_weeks).overview(shownWeek)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={back}
        title={path.title}
        action={
          <Button variant="outline" onClick={() => setSettingsKey(Date.now())}>
            <Settings2 aria-hidden />
            {t('learning.editPlan')}
          </Button>
        }
        intro={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge tone={path.status === 'active' ? 'accent' : 'neutral'}>
              {t(`learning.status.${path.status}`)}
            </Badge>
            <Badge>
              {isBuiltInPlan(path.curriculum_key) ? t('learning.builtIn') : t('learning.custom')}
            </Badge>
          </span>
        }
      />

      <Card className="flex flex-col gap-4">
        <PlanStats summary={summary} />
        <div className="flex flex-wrap items-center gap-2">
          <PathStatusButtons path={path} />
        </div>
      </Card>

      <WeekNav
        week={shownWeek}
        totalWeeks={totalWeeks}
        currentWeek={currentWeek}
        phase={overview.phase}
        firstDate={dates[0] ?? path.start_date}
        lastDate={dates[dates.length - 1] ?? path.start_date}
        onChange={setWeek}
      />
      <WeekOverview key={shownWeek} overview={overview} />
      <PlanWeekEditor path={path} week={shownWeek} todayISO={today} />

      {settingsKey !== null && (
        <PlanDialog
          key={settingsKey}
          open
          onClose={() => setSettingsKey(null)}
          todayISO={today}
          path={path}
        />
      )}
    </div>
  )
}
