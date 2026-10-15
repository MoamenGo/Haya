import { useTranslation } from 'react-i18next'
import type { PathSummary } from '../hooks'

const PERCENT = 100

/** Three calm numbers (week, weeks left, share done) and a thin progress line. */
export function PlanStats({ summary }: { summary: PathSummary }) {
  const { t } = useTranslation()
  const { week, totalWeeks, progress } = summary
  const current = Math.min(Math.max(week, 0), totalWeeks)
  // Weeks after the current one; all of them before the plan starts.
  const left = week <= 0 ? totalWeeks : Math.max(totalWeeks - week, 0)
  const pct = Math.round(progress * PERCENT)

  const cells = [
    {
      label: t('learning.statWeek'),
      value: t('learning.ofTotal', { n: current, total: totalWeeks }),
    },
    { label: t('learning.statLeft'), value: t('learning.statLeftValue', { count: left }) },
    { label: t('learning.statDone'), value: `${pct}%` },
  ]

  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-3 rounded-xl bg-subtle/70 py-2.5 [&>*+*]:border-s [&>*+*]:border-border">
        {cells.map((cell) => (
          <div key={cell.label} className="flex flex-col items-center gap-0.5 px-2 text-center">
            <dt className="text-xs text-muted">{cell.label}</dt>
            <dd className="font-display text-base font-medium tabular-nums">{cell.value}</dd>
          </div>
        ))}
      </dl>
      <div
        role="progressbar"
        aria-label={t('learning.progress', { pct })}
        aria-valuemin={0}
        aria-valuemax={PERCENT}
        aria-valuenow={pct}
        className="h-1.5 overflow-hidden rounded-full bg-subtle"
      >
        <div
          className="h-full rounded-full bg-primary/75 transition-[inline-size] duration-500"
          style={{ inlineSize: `${pct}%` }}
        />
      </div>
    </div>
  )
}
