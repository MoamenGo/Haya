import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { HABIT_PRESETS } from '../habitPresets'
import { createRoutine } from '../repo'

/** Suggested habits not added yet, one tap each. */
export function HabitPresets({ existing }: { existing: string[] }) {
  const { t } = useTranslation()
  const available = HABIT_PRESETS.filter((preset) => !existing.includes(preset.title))
  if (available.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-medium">{t('habits.suggested')}</h2>
        <p className="text-sm text-muted">{t('habits.suggestedHint')}</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {available.map((preset) => (
          <li key={preset.title}>
            <button
              type="button"
              onClick={() => void createRoutine(preset)}
              className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <Plus aria-hidden className="size-4 text-primary" />
              <span>{preset.title}</span>
              <span className="text-xs text-muted">{t(`blocks.${preset.anchor}`)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
