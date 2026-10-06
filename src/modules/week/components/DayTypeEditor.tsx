import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ChoiceGroup } from '@/components/ui/choice-group'
import { Input } from '@/components/ui/input'
import { DAY_TYPES, type DayType } from '@/core/time/config'
import { dayTypeForDate } from '@/core/time/dayType'
import type { DayInfo } from '@/modules/days/repo'
import { clearOverride, setOverride } from '@/modules/days/repo'
import { CAPACITY_MAX_MIN } from '@/modules/days/schema'

interface DayTypeEditorProps {
  day: DayInfo
  onDone: () => void
}

/** Change one date's type (leave, exam, travel, illness) without touching the weekly pattern. */
export function DayTypeEditor({ day, onDone }: DayTypeEditorProps) {
  const { t } = useTranslation()
  const [dayType, setDayType] = useState<DayType>(day.dayType)
  const [minutes, setMinutes] = useState(day.override?.capacity_min?.toString() ?? '')
  const [note, setNote] = useState(day.override?.note ?? '')
  const usual = dayTypeForDate(day.date)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const custom = minutes.trim() === '' ? null : Math.round(Number(minutes))
    if (dayType === usual && custom === null && note.trim() === '') {
      await clearOverride(day.date)
    } else {
      await setOverride({
        date: day.date,
        day_type: dayType,
        capacity_min: Number.isFinite(custom) ? custom : null,
        note,
      })
    }
    onDone()
  }

  async function reset() {
    await clearOverride(day.date)
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-lg bg-accent p-3">
      <ChoiceGroup
        label={t('week.dayType')}
        value={dayType}
        options={DAY_TYPES.map((value) => ({ value, label: t(`dayTypes.${value}`) }))}
        onChange={setDayType}
      />
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {t('week.freeMinutes')}
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={CAPACITY_MAX_MIN}
            value={minutes}
            placeholder={t('week.freeMinutesDefault')}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-32"
          />
        </label>
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm">
          {t('week.note')}
          <Input
            value={note}
            placeholder={t('week.notePlaceholder')}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">{t('week.save')}</Button>
        {day.override && (
          <Button variant="outline" onClick={() => void reset()}>
            {t('week.reset', { type: t(`dayTypes.${usual}`) })}
          </Button>
        )}
        <Button variant="ghost" onClick={onDone}>
          {t('week.cancel')}
        </Button>
      </div>
    </form>
  )
}
