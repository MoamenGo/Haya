import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import type { WeekFacts } from '../hooks'

/** What the week looked like, stated plainly. No scores, no colours for "bad". */
export function WeekFactsCard({ facts }: { facts: WeekFacts }) {
  const { t } = useTranslation()
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-medium">{t('weekly.factsTitle')}</h2>
      <ul className="flex flex-col gap-1 text-sm">
        <li>{t('weekly.tasksDone', { count: facts.tasksDone })}</li>
        <li>{t('weekly.habitDays', { count: facts.habitDays })}</li>
        <li>{t('weekly.checkIns', { count: facts.checkIns })}</li>
        {facts.averageEnergy !== null && (
          <li>{t('weekly.energy', { value: facts.averageEnergy })}</li>
        )}
      </ul>
      {facts.inboxCount > 0 && (
        <p className="rounded-lg bg-accent p-3 text-sm">
          {t('weekly.inbox', { count: facts.inboxCount })}{' '}
          <Link to="/inbox" className="font-medium text-primary underline-offset-4 hover:underline">
            {t('weekly.openInbox')}
          </Link>
        </p>
      )}
    </Card>
  )
}
