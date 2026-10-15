import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { LearningPathStatus } from '@/core/db/types'
import { CURRICULA } from '@/core/learning/plan'
import { planStartISO } from '@/core/learning/week'
import { instantOfISO } from '@/core/time/date'
import { formatDayMonth } from '@/core/time/format'
import { useSetting } from '@/modules/settings/hooks'
import type { PathSummary } from '../hooks'
import { TooManyActivePathsError, setPathStatus } from '../repo'
import { PathStartForm } from './PathStartForm'
import { WeekMap } from './WeekMap'

const PERCENT = 100

/** One plan: status, where it stands, a calm progress line, and its controls. */
export function PathCard({ summary }: { summary: PathSummary }) {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const [message, setMessage] = useState<string | null>(null)
  const { path, week, totalWeeks, progress } = summary
  const curriculum = CURRICULA[path.curriculum_key]
  const started = week > 0
  const finished = week > totalWeeks
  const currentWeek = Math.min(Math.max(week, 1), totalWeeks)

  async function change(status: LearningPathStatus) {
    try {
      await setPathStatus(path.id, status)
      setMessage(null)
    } catch (error) {
      if (error instanceof TooManyActivePathsError) setMessage(t('learning.limit'))
      else throw error
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 dir="auto" className="text-lg font-medium">
          {path.title}
        </h2>
        <Badge tone={path.status === 'active' ? 'accent' : 'neutral'}>
          {t(`learning.status.${path.status}`)}
        </Badge>
      </div>

      <p dir="auto" className="text-sm text-muted">
        {!started
          ? t('learning.notStarted', {
              date: formatDayMonth(instantOfISO(planStartISO(path.start_date)), language),
            })
          : finished
            ? t('learning.finished')
            : `${t('learning.weekOfTotal', { week, total: totalWeeks })} · ${curriculum.overview(week).phase}`}
      </p>

      <div className="flex flex-col gap-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-subtle" aria-hidden>
          <div
            className="h-full rounded-full bg-primary/70"
            style={{ inlineSize: `${Math.round(progress * PERCENT)}%` }}
          />
        </div>
        <p className="text-xs text-muted">
          {t('learning.progress', { pct: Math.round(progress * PERCENT) })}
        </p>
      </div>

      {message && (
        <p role="status" className="rounded-lg bg-accent p-2 text-sm">
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {path.status === 'active' ? (
          <Button variant="outline" onClick={() => void change('paused')}>
            {t('learning.pause')}
          </Button>
        ) : (
          <Button onClick={() => void change('active')}>{t('learning.resume')}</Button>
        )}
        {path.status !== 'done' && (
          <Button variant="ghost" onClick={() => void change('done')}>
            {t('learning.finish')}
          </Button>
        )}
      </div>

      <PathStartForm pathId={path.id} startDate={path.start_date} />
      <WeekMap curriculumKey={path.curriculum_key} initialWeek={currentWeek} />
    </Card>
  )
}
