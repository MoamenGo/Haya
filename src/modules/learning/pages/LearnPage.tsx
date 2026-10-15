import { Plus, Route } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ListSkeleton } from '@/components/ui/skeleton'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { PathCard } from '../components/PathCard'
import { PlanDialog } from '../components/PlanDialog'
import { usePathSummaries } from '../hooks'

/** The learning plans: where each one stands, and a way to write a new one (CLAUDE.md §6.10). */
export function LearnPage() {
  const { t } = useTranslation()
  const today = localDateISO(useNow())
  const summaries = usePathSummaries(today)
  const [creating, setCreating] = useState(false)
  // A fresh key each time the dialog opens, so its fields start empty.
  const [dialogKey, setDialogKey] = useState(0)

  function openNew() {
    setDialogKey((k) => k + 1)
    setCreating(true)
  }

  const newButton = (
    <Button onClick={openNew}>
      <Plus aria-hidden />
      {t('learning.newPlan')}
    </Button>
  )

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t('learning.title')} intro={t('learning.intro')} action={newButton} />
      {summaries === undefined ? (
        <ListSkeleton rows={2} />
      ) : summaries.length === 0 ? (
        <EmptyState
          icon={Route}
          title={t('learning.empty')}
          description={t('learning.emptyHint')}
          action={newButton}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {summaries.map((summary) => (
            <PathCard key={summary.path.id} summary={summary} />
          ))}
        </div>
      )}
      <PlanDialog
        key={dialogKey}
        open={creating}
        onClose={() => setCreating(false)}
        todayISO={today}
      />
    </div>
  )
}
