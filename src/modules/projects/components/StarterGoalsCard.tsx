import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { addStarterGoals, missingStarterGoals } from '../repo'

/** One tap adds the goals from our planning talks, each with a project and first steps. */
export function StarterGoalsCard() {
  const { t } = useTranslation()
  const missing = useLiveQuery(missingStarterGoals, [])
  const [added, setAdded] = useState<number | null>(null)

  if (added !== null) {
    return (
      <p role="status" className="rounded-2xl bg-accent p-4 text-sm">
        {t('projects.starterAdded', { count: added })}
      </p>
    )
  }
  if (!missing || missing.length === 0) return null

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-dashed border-primary/40 bg-surface p-4 sm:p-6">
      <div>
        <h2 className="font-medium">{t('projects.starterTitle')}</h2>
        <p className="mt-1 text-sm text-muted">
          {t('projects.starterBody', { count: missing.length })}
        </p>
      </div>
      <div>
        <Button onClick={() => void addStarterGoals().then(setAdded)}>
          {t('projects.starterAdd')}
        </Button>
      </div>
    </section>
  )
}
