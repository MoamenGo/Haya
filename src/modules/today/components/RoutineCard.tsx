import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
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

export function RoutineCard({ routine, status, minimumMode, days, onChange }: RoutineCardProps) {
  const { t } = useTranslation()
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gold">{t(`blocks.${routine.anchor}`)}</p>
          <h3 className="text-lg font-semibold">{routine.title}</h3>
        </div>
        <div className="pt-1">
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
    </Card>
  )
}
