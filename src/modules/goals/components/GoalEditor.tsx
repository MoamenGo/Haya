import { useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GOAL_HORIZONS, type GoalHorizon, type GoalRow } from '@/core/db/types'
import { deleteGoal, updateGoal } from '../repo'

type Mode = 'idle' | 'editing' | 'confirmDelete'

/** The top of the goal map: the goal itself, with edit and delete. */
export function GoalEditor({ goal }: { goal: GoalRow }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('idle')

  async function remove() {
    await deleteGoal(goal.id)
    await navigate({ to: '/goals' })
  }

  if (mode === 'editing') return <GoalForm goal={goal} onDone={() => setMode('idle')} />

  return (
    <header className="flex flex-col gap-2">
      <p className="text-xs text-muted">
        {t(`goals.horizons.${goal.horizon}`)} · {t(`goalMap.status.${goal.status}`)}
      </p>
      <h1 dir="auto" className="text-2xl">
        {goal.title}
      </h1>
      {goal.why && (
        <p dir="auto" className="text-muted">
          <span className="font-medium text-foreground">{t('goalMap.why')}: </span>
          {goal.why}
        </p>
      )}
      {goal.desired_outcome && (
        <p dir="auto" className="text-muted">
          <span className="font-medium text-foreground">{t('goalMap.outcome')}: </span>
          {goal.desired_outcome}
        </p>
      )}
      {mode === 'confirmDelete' ? (
        <div role="alert" className="flex flex-col gap-2 rounded-xl bg-accent p-3 text-sm">
          <p>{t('goalMap.deleteConfirm')}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void remove()}>
              {t('goalMap.deleteYes')}
            </Button>
            <Button variant="ghost" onClick={() => setMode('idle')}>
              {t('projects.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-1">
          <Button variant="outline" onClick={() => setMode('editing')}>
            {t('common.edit')}
          </Button>
          <Button variant="ghost" onClick={() => setMode('confirmDelete')}>
            {t('goalMap.delete')}
          </Button>
        </div>
      )}
    </header>
  )
}

function GoalForm({ goal, onDone }: { goal: GoalRow; onDone: () => void }) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(goal.title)
  const [why, setWhy] = useState(goal.why)
  const [outcome, setOutcome] = useState(goal.desired_outcome)
  const [horizon, setHorizon] = useState<GoalHorizon>(goal.horizon)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    await updateGoal(goal.id, { title, why, desired_outcome: outcome, horizon })
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl bg-surface p-4 sm:p-6">
      <label className="flex flex-col gap-1 text-sm">
        {t('goals.titleLabel')}
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('goals.whyLabel')}
        <Input value={why} onChange={(e) => setWhy(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('goalMap.outcomeLabel')}
        <Input value={outcome} onChange={(e) => setOutcome(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('goals.horizonLabel')}
        <select
          value={horizon}
          onChange={(e) => setHorizon(e.target.value as GoalHorizon)}
          className="min-h-11 rounded-xl border border-border bg-surface-raised px-3"
        >
          {GOAL_HORIZONS.map((h) => (
            <option key={h} value={h}>
              {t(`goals.horizons.${h}`)}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={!title.trim()}>
          {t('common.save')}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          {t('projects.cancel')}
        </Button>
      </div>
    </form>
  )
}
