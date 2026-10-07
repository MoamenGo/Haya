import { useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { DailyLogRow } from '@/core/db/types'
import { saveDailyLog } from '../repo'
import { SLEEP_HOURS_MAX } from '../schema'
import { EnergyPicker } from './EnergyPicker'

const inputClass =
  'min-h-11 rounded-xl border border-border bg-surface-raised px-3 focus-visible:outline-2 focus-visible:outline-primary'

interface DailyLogFormProps {
  dateISO: string
  initial: DailyLogRow | undefined
}

/** Energy, sleep, gratitude and tomorrow's one thing. Only the date is required. */
export function DailyLogForm({ dateISO, initial }: DailyLogFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [energy, setEnergy] = useState<number | null>(initial?.energy ?? null)
  const [sleep, setSleep] = useState(initial?.sleep_hours?.toString() ?? '')
  const [gratitude, setGratitude] = useState(initial?.gratitude ?? '')
  const [tomorrow, setTomorrow] = useState(initial?.tomorrow_top3[0] ?? '')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const sleepHours = sleep.trim() === '' ? null : Number(sleep)
    await saveDailyLog({
      date: dateISO,
      energy,
      sleep_hours: Number.isFinite(sleepHours) ? sleepHours : null,
      gratitude,
      tomorrow_top3: tomorrow.trim() ? [tomorrow.trim()] : [],
    })
    await navigate({ to: '/today' })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <EnergyPicker value={energy} onChange={setEnergy} />

      <label className="flex flex-col gap-2">
        <span className="font-medium">{t('review.sleep')}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={SLEEP_HOURS_MAX}
          step={0.5}
          value={sleep}
          onChange={(e) => setSleep(e.target.value)}
          className={`${inputClass} w-28`}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-medium">{t('review.gratitude')}</span>
        <input
          dir="auto"
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-medium">{t('review.tomorrow')}</span>
        <input
          dir="auto"
          value={tomorrow}
          onChange={(e) => setTomorrow(e.target.value)}
          className={inputClass}
        />
      </label>

      <Button type="submit" className="min-h-12 text-base">
        {t('review.save')}
      </Button>
    </form>
  )
}
