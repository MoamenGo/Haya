import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { ListSkeleton } from '@/components/ui/skeleton'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { PathCard } from '../components/PathCard'
import { usePathSummaries } from '../hooks'

/** The learning plans: where each one stands, pause/resume, and its week map (CLAUDE.md §6.10). */
export function LearnPage() {
  const { t } = useTranslation()
  const today = localDateISO(useNow())
  const summaries = usePathSummaries(today)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t('learning.title')} intro={t('learning.intro')} />
      {summaries === undefined ? (
        <ListSkeleton rows={2} />
      ) : summaries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
          {t('learning.empty')}
        </p>
      ) : (
        summaries.map((summary) => <PathCard key={summary.path.id} summary={summary} />)
      )}
    </div>
  )
}
