import { Link } from '@tanstack/react-router'
import { ArrowRight, GraduationCap, PenLine } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { isBuiltInPlan } from '@/core/learning/types'
import { planStartISO } from '@/core/learning/week'
import { instantOfISO } from '@/core/time/date'
import { formatDayMonth } from '@/core/time/format'
import { useSetting } from '@/modules/settings/hooks'
import type { PathSummary } from '../hooks'
import { PathStatusButtons } from './PathStatusButtons'
import { PlanStats } from './PlanStats'

/** One plan on the plans screen: where it stands, and the way into it. */
export function PathCard({ summary }: { summary: PathSummary }) {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const { path, week, totalWeeks, overview } = summary
  const builtIn = isBuiltInPlan(path.curriculum_key)
  const Icon = builtIn ? GraduationCap : PenLine

  const where =
    week <= 0
      ? t('learning.notStarted', {
          date: formatDayMonth(instantOfISO(planStartISO(path.start_date)), language),
        })
      : week > totalWeeks
        ? t('learning.finished')
        : [t('learning.weekOfTotal', { week, total: totalWeeks }), overview.phase]
            .filter(Boolean)
            .join(' · ')

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary ring-1 ring-primary/15">
          <Icon aria-hidden className="size-5" strokeWidth={1.8} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 dir="auto" className="font-display text-lg font-medium">
              <Link
                to="/learn/$pathId"
                params={{ pathId: path.id }}
                className="underline-offset-4 hover:text-primary hover:underline"
              >
                {path.title}
              </Link>
            </h2>
            <Badge tone={path.status === 'active' ? 'accent' : 'neutral'}>
              {t(`learning.status.${path.status}`)}
            </Badge>
            <Badge>{builtIn ? t('learning.builtIn') : t('learning.custom')}</Badge>
          </div>
          <p dir="auto" className="text-sm text-muted">
            {where}
          </p>
          {overview.title && week > 0 && week <= totalWeeks && (
            <p dir="auto" className="text-sm">
              {overview.title}
            </p>
          )}
        </div>
      </div>

      <PlanStats summary={summary} />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/learn/$pathId"
          params={{ pathId: path.id }}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[0_6px_16px_-8px_var(--primary)] transition-colors hover:bg-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:min-h-10"
        >
          {t('learning.open')}
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
        <PathStatusButtons path={path} />
      </div>
    </Card>
  )
}
