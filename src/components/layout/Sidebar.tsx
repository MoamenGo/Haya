import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { SyncIndicator } from '@/modules/account/components/SyncIndicator'
import { openCapture } from '@/modules/inbox/captureEvents'
import { BrandMark } from './BrandMark'
import { NAV_ITEMS } from './nav-items'

/** Desktop navigation (hidden on small screens). */
export function Sidebar() {
  const { t } = useTranslation()
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-border/70 bg-surface/70 md:flex">
      <div className="flex items-center gap-3 px-5 pt-7 pb-5">
        <BrandMark />
        <div className="min-w-0">
          <p className="text-xl leading-tight font-bold text-primary">{t('app.name')}</p>
          <p className="text-xs leading-snug text-muted">{t('app.tagline')}</p>
        </div>
      </div>
      <div className="px-3 pb-5">
        <Button onClick={openCapture} className="w-full">
          <Plus aria-hidden className="size-4" />
          {t('capture.open')}
          <kbd className="ms-auto rounded-md bg-primary-foreground/15 px-1.5 py-0.5 font-sans text-xs">
            Ctrl K
          </kbd>
        </Button>
      </div>
      <nav aria-label={t('nav.main')} className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
        {NAV_ITEMS.filter((item) => item.desktop).map(({ to, labelKey, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted transition-colors hover:bg-accent hover:text-foreground"
            activeProps={{
              className:
                'bg-accent font-semibold !text-primary before:absolute before:inset-y-2 before:start-0 before:w-1 before:rounded-full before:bg-primary',
            }}
          >
            <Icon aria-hidden className="size-5" />
            {t(labelKey)}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border/70 px-3 py-3">
        <SyncIndicator className="w-full" />
      </div>
    </aside>
  )
}
