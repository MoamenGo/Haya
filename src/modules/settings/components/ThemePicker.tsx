import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BrandMark } from '@/components/layout/BrandMark'
import { useSetting } from '../hooks'
import { PALETTES } from '../palettes'

/**
 * The ten colour themes, each shown as a small live preview. Every card sets
 * `data-palette` on itself, so it draws in its own colours (and in light or
 * dark, following the current mode) whatever palette the page is using.
 * Real radio buttons underneath give keyboard arrows and screen readers for free.
 */
export function ThemePicker() {
  const { t } = useTranslation()
  const [palette, setPalette] = useSetting('palette')

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-medium">{t('settings.palette')}</legend>
      <p className="-mt-1 mb-1 text-sm text-muted">{t('settings.paletteHint')}</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
        {PALETTES.map((id) => {
          const checked = palette === id
          return (
            <label
              key={id}
              data-palette={id}
              className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface text-foreground transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-card has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/25 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring motion-reduce:transition-none"
            >
              <input
                type="radio"
                name="palette"
                value={id}
                checked={checked}
                onChange={() => void setPalette(id)}
                className="sr-only"
              />
              {/* A tiny version of the app: logo, two lines of text, a button. */}
              <span aria-hidden className="flex items-center gap-2 bg-background p-3">
                <BrandMark className="size-7" />
                <span className="flex flex-1 flex-col gap-1.5">
                  <span className="h-1.5 w-4/5 rounded-full bg-foreground/80" />
                  <span className="h-1.5 w-1/2 rounded-full bg-muted/50" />
                </span>
                <span className="h-5 w-7 rounded-md bg-primary" />
              </span>
              <span className="flex items-start gap-2 border-t border-border p-3">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-semibold">{t(`settings.palettes.${id}.name`)}</span>
                  <span className="text-xs leading-snug text-muted">
                    {t(`settings.palettes.${id}.mood`)}
                  </span>
                </span>
                {checked && <CheckCircle2 aria-hidden className="size-4 shrink-0 text-primary" />}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
