import { useTranslation } from 'react-i18next'
import type { ContinuityDay } from '@/core/habits/continuity'
import type { HabitStatus, RoutineRow } from '@/core/db/types'
import { ContinuityDots } from './ContinuityDots'
import { StatusButtons } from './StatusButtons'

interface RoutineCardProps {
  routine: RoutineRow
  status: HabitStatus | null
  minimumMode: boolean
  days: ContinuityDay[]
  onChange: (status: HabitStatus | null) => void
}

/** One habit as a row inside the habits panel on Today. */
export function RoutineCard({ routine, status, minimumMode, days, onChange }: RoutineCardProps) {
  const { t } = useTranslation()
  return (
    <li className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted">{t(`blocks.${routine.anchor}`)}</p>
          <h3 className="text-lg font-semibold">{routine.title}</h3>
        </div>
        <div className="pt-1.5">
          <ContinuityDots days={days} />
        </div>
      </div>
      <dl className="text-sm leading-relaxed">
        {!minimumMode && (
          <div className="flex gap-2">
            <dt className="text-muted">{t('habit.fullVersion')}:</dt>
            <dd>{routine.full_version}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="text-muted">{t('habit.minimumVersion')}:</dt>
          <dd>{routine.minimum_version}</dd>
        </div>
      </dl>
      <StatusButtons label={routine.title} status={status} onChange={onChange} />
    </li>
  )
}
