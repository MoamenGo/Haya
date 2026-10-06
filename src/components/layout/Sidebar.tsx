import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { openCapture } from '@/modules/inbox/captureEvents'
import { NAV_ITEMS } from './nav-items'

/** Desktop navigation (hidden on small screens). */
export function Sidebar() {
  const { t } = useTranslation()
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-e border-border bg-surface md:block">
      <div className="px-5 py-6">
        <p className="text-xl font-semibold text-primary">{t('app.name')}</p>
        <p className="mt-1 text-sm text-muted">{t('app.tagline')}</p>
      </div>
      <div className="px-3 pb-4">
        <Button onClick={openCapture} className="w-full">
          <Plus aria-hidden className="size-4" />
          {t('capture.open')}
          <kbd className="ms-auto text-xs opacity-70">Ctrl K</kbd>
        </Button>
      </div>
      <nav aria-label={t('nav.main')} className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.filter((item) => item.desktop).map(({ to, labelKey, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-accent"
            activeProps={{ className: 'bg-accent font-medium !text-foreground' }}
          >
            <Icon aria-hidden className="size-5" />
            {t(labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
