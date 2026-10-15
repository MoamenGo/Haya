import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { WeekOverview as Overview } from '@/core/learning/types'

/** What a built-in plan's week is about: topics, project, milestone and sources. */
export function WeekOverview({ overview }: { overview: Overview }) {
  const { t } = useTranslation()
  const o = overview
  if (!o.title && o.topics.length === 0) return null

  return (
    <details className="group rounded-2xl border border-border bg-surface p-4 sm:p-5" open>
      <summary className="cursor-pointer list-none text-sm font-medium [&::-webkit-details-marker]:hidden">
        <span className="text-xs text-muted">{t('learning.about')}</span>
        {o.title && (
          <span dir="auto" className="mt-0.5 block font-display text-base">
            {o.title}
          </span>
        )}
      </summary>
      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        {o.topics.length > 0 && (
          <Block title={t('learning.topics')}>
            <ul className="list-disc ps-5">
              {o.topics.map((topic) => (
                <li key={topic} dir="auto">
                  {topic}
                </li>
              ))}
            </ul>
          </Block>
        )}
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
        {o.project && <Block title={t('learning.project')}>{o.project}</Block>}
        {o.milestone && <Block title={t('learning.milestone')}>{o.milestone}</Block>}
      </div>
    </details>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted">{title}</p>
      <div dir="auto">{children}</div>
    </div>
  )
}
