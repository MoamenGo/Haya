import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useSetting } from '@/modules/settings/hooks'

const OPTIONS = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
] as const

/** Light / dark / system, saved in Settings (so it syncs) from the top bar. */
export function ThemeMenu() {
  const { t } = useTranslation()
  const [theme, setTheme] = useSetting('theme')
  const menu = useRef<HTMLDetailsElement>(null)
  const Current = OPTIONS.find((o) => o.value === theme)?.icon ?? Monitor

  // Close when tapping outside or pressing Escape.
  useEffect(() => {
    const close = (event: Event) => {
      const details = menu.current
      if (!details?.open) return
      if (
        event instanceof KeyboardEvent
          ? event.key === 'Escape'
          : !details.contains(event.target as Node)
      ) {
        details.open = false
      }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [])

  return (
    <details ref={menu} className="relative">
      <summary
        aria-label={t('settings.theme')}
        className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Current aria-hidden className="size-[1.125rem]" />
      </summary>
      <div
        role="menu"
        className="absolute end-0 z-30 mt-1 flex w-44 animate-fade-up flex-col rounded-xl border border-border bg-surface-raised p-1 shadow-float"
      >
        {OPTIONS.map(({ value, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="menuitemradio"
            aria-checked={theme === value}
            onClick={() => {
              void setTheme(value)
              if (menu.current) menu.current.open = false
            }}
            className={cn(
              'flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm hover:bg-subtle',
              theme === value && 'font-medium',
            )}
          >
            <Icon aria-hidden className="size-4 text-muted" />
            <span className="flex-1 text-start">{t(`settings.themes.${value}`)}</span>
            {theme === value && <Check aria-hidden className="size-4 text-primary" />}
          </button>
        ))}
      </div>
    </details>
  )
}
