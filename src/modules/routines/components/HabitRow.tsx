import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { RoutineRow } from '@/core/db/types'
import { deleteRoutine, setRoutineActive } from '../repo'

/** One habit on the Habits page: what it is, plus pause/resume and remove. */
export function HabitRow({ routine }: { routine: RoutineRow }) {
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState(false)

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
      <div className="min-w-0">
        <p className="text-xs text-muted">{t(`blocks.${routine.anchor}`)}</p>
        <h3 dir="auto" className="font-semibold">
          {routine.title}
        </h3>
        {routine.full_version && (
          <p className="mt-1 text-sm text-muted">
            {t('habit.fullVersion')}: <span dir="auto">{routine.full_version}</span>
          </p>
        )}
        <p className="text-sm text-muted">
          {t('habit.minimumVersion')}: <span dir="auto">{routine.minimum_version}</span>
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {confirming ? (
          <>
            <Button variant="outline" onClick={() => void deleteRoutine(routine.id)}>
              {t('habits.confirmRemove')}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              {t('projects.cancel')}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => void setRoutineActive(routine.id, !routine.active)}
            >
              {routine.active ? t('habits.pause') : t('habits.resume')}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(true)}>
              {t('habits.remove')}
            </Button>
          </>
        )}
      </div>
    </li>
  )
}
