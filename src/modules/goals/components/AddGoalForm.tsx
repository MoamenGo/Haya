import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { GOAL_HORIZONS, type GoalHorizon } from '@/core/db/types'
import { createGoal } from '../repo'

export function AddGoalForm() {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  const [horizon, setHorizon] = useState<GoalHorizon>('quarter')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    await createGoal({ title, why, horizon })
    setTitle('')
    setWhy('')
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <h2 className="font-medium">{t('goals.add')}</h2>
      <label className="flex flex-col gap-1 text-sm">
        {t('goals.titleLabel')}
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('goals.whyLabel')}
        <Input value={why} onChange={(e) => setWhy(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('goals.horizonLabel')}
        <Select value={horizon} onChange={(e) => setHorizon(e.target.value as GoalHorizon)}>
          {GOAL_HORIZONS.map((h) => (
            <option key={h} value={h}>
              {t(`goals.horizons.${h}`)}
            </option>
          ))}
        </Select>
      </label>
      <div>
        <Button type="submit" disabled={!title.trim()}>
          {t('goals.create')}
        </Button>
      </div>
    </form>
  )
}
