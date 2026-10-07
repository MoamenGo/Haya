import { useLiveQuery } from 'dexie-react-hooks'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { listGoals } from '@/modules/goals/repo'
import { createProject } from '../repo'

/** `goalId` fixes the goal (on the goal map); without it the owner may pick one. */
export function AddProjectForm({ goalId: fixedGoal }: { goalId?: string } = {}) {
  const { t } = useTranslation()
  const goals = useLiveQuery(listGoals, []) ?? []
  const [title, setTitle] = useState('')
  const [outcome, setOutcome] = useState('')
  const [goalId, setGoalId] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    await createProject({ title, outcome, goal_id: fixedGoal ?? (goalId || null) })
    setTitle('')
    setOutcome('')
    setGoalId('')
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <h2 className="font-medium">{t('projects.add')}</h2>
      <label className="flex flex-col gap-1 text-sm">
        {t('projects.titleLabel')}
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('projects.outcomeLabel')}
        <Input value={outcome} onChange={(e) => setOutcome(e.target.value)} />
      </label>
      {!fixedGoal && goals.length > 0 && (
        <label className="flex flex-col gap-1 text-sm">
          {t('projects.goalLabel')}
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="min-h-11 rounded-xl border border-border bg-surface-raised px-3"
          >
            <option value="">{t('projects.noGoal')}</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <div>
        <Button type="submit" disabled={!title.trim()}>
          {t('projects.create')}
        </Button>
      </div>
    </form>
  )
}
