import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { GoalRow, GoalStatus } from '@/core/db/types'
import { GoalLimitError, setGoalStatus } from '../repo'

export function GoalCard({ goal }: { goal: GoalRow }) {
  const { t } = useTranslation()
  const [message, setMessage] = useState<string | null>(null)

  async function change(status: GoalStatus) {
    try {
      await setGoalStatus(goal, status)
      setMessage(null)
    } catch (error) {
      if (error instanceof GoalLimitError) setMessage(t('goals.limit'))
      else throw error
    }
  }

  return (
    <Card className="flex flex-col gap-2">
      <p className="text-xs text-muted">{t(`goals.horizons.${goal.horizon}`)}</p>
      <h3 dir="auto" className="font-medium">
        <Link
          to="/goals/$goalId"
          params={{ goalId: goal.id }}
          className="underline-offset-4 hover:text-primary hover:underline"
        >
          {goal.title}
        </Link>
      </h3>
      {goal.why && (
        <p dir="auto" className="text-sm text-muted">
          {goal.why}
        </p>
      )}
      {message && (
        <p role="status" className="rounded-lg bg-accent p-2 text-sm">
          {message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {goal.status !== 'active' && goal.status !== 'done' && (
          <Button onClick={() => void change('active')}>{t('goals.start')}</Button>
        )}
        <Link
          to="/goals/$goalId"
          params={{ goalId: goal.id }}
          className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-primary hover:bg-accent"
        >
          {t('goals.openMap')}
        </Link>
        {goal.status === 'active' && (
          <>
            <Button variant="outline" onClick={() => void change('done')}>
              {t('goals.finish')}
            </Button>
            <Button variant="ghost" onClick={() => void change('idea')}>
              {t('goals.park')}
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
