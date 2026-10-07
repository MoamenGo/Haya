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
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col md:flex">
      <div className="flex items-center gap-3 px-5 pt-7 pb-5">
        <BrandMark />
        <div className="min-w-0">
          <p className="font-display text-2xl leading-tight font-bold">{t('app.name')}</p>
          <p className="text-xs leading-snug text-muted">{t('app.tagline')}</p>
        </div>
      </div>
      <div className="px-3 pb-5">
        <Button
          onClick={openCapture}
          className="w-full bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus aria-hidden className="size-4" />
          {t('capture.open')}
          <kbd className="ms-auto rounded-md bg-background/15 px-1.5 py-0.5 font-sans text-xs">
            Ctrl K
          </kbd>
        </Button>
      </div>
      <nav aria-label={t('nav.main')} className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
        {NAV_ITEMS.filter((item) => item.desktop).map(({ to, labelKey, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex min-h-11 items-center gap-3 rounded-full px-4 text-sm text-muted transition-colors hover:bg-surface/70 hover:text-foreground"
            activeProps={{
              className:
                'bg-surface font-medium !text-foreground shadow-card ring-1 ring-border [&>svg]:text-primary',
            }}
          >
            <Icon aria-hidden className="size-5" />
            {t(labelKey)}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-3">
        <SyncIndicator className="w-full" />
      </div>
    </aside>
  )
}
