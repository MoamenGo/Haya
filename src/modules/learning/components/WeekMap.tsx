import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { CURRICULA } from '@/core/learning/plan'
import type { CurriculumKey } from '@/core/learning/types'

interface WeekMapProps {
  curriculumKey: CurriculumKey
  /** The week shown first: the plan's current week. */
  initialWeek: number
}

/** Browse a plan week by week: topics, project, milestone and sources. Folded by default. */
export function WeekMap({ curriculumKey, initialWeek }: WeekMapProps) {
  const { t, i18n } = useTranslation()
  const [week, setWeek] = useState(initialWeek)
  const curriculum = CURRICULA[curriculumKey]
  const o = curriculum.overview(week)
  // "Previous" points toward the start of the line: right in Arabic, left in English.
  const rtl = i18n.dir() === 'rtl'
  const Prev = rtl ? ChevronRight : ChevronLeft
  const Next = rtl ? ChevronLeft : ChevronRight

  return (
    <details className="rounded-xl border border-border p-3">
      <summary className="cursor-pointer text-sm font-medium">{t('learning.map')}</summary>
      <div className="mt-3 flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('learning.prevWeek')}
            disabled={week <= 1}
            onClick={() => setWeek(week - 1)}
          >
            <Prev aria-hidden />
          </Button>
          <div className="text-center">
            <p className="font-medium">
              {t('learning.weekOfTotal', { week, total: curriculum.totalWeeks })}
            </p>
            <p dir="auto" className="text-xs text-muted">
              {o.phase}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('learning.nextWeek')}
            disabled={week >= curriculum.totalWeeks}
            onClick={() => setWeek(week + 1)}
          >
            <Next aria-hidden />
          </Button>
        </div>
        {week !== initialWeek && (
          <Button
            variant="ghost"
            size="sm"
            className="self-center"
            onClick={() => setWeek(initialWeek)}
          >
            {t('learning.thisWeek')}
          </Button>
        )}

        <h3 dir="auto" className="font-medium">
          {o.title}
        </h3>
        <Block title={t('learning.topics')}>
          <ul className="list-disc ps-5">
            {o.topics.map((topic) => (
              <li key={topic} dir="auto">
                {topic}
              </li>
            ))}
          </ul>
        </Block>
        {o.project && <Block title={t('learning.project')}>{o.project}</Block>}
        {o.milestone && <Block title={t('learning.milestone')}>{o.milestone}</Block>}
        {o.resources.length > 0 && (
          <Block title={t('learning.resources')}>
            <ul className="flex flex-col gap-1">
              {o.resources.map((r) => (
                <li key={`${r.title}${r.url ?? ''}`} dir="auto">
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                    >
                      <ExternalLink aria-hidden className="size-3 shrink-0" />
                      {r.title}
                    </a>
                  ) : (
                    r.title
                  )}
                </li>
              ))}
            </ul>
          </Block>
        )}
      </div>
    </details>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted">{title}</p>
      <div dir="auto">{children}</div>
    </div>
  )
}
