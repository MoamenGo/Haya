import { Link } from '@tanstack/react-router'
import { Plus, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { isCloudConfigured } from '@/core/auth/client'
import { SyncIndicator } from '@/modules/account/components/SyncIndicator'
import { useSession } from '@/modules/account/hooks'
import { openCapture } from '@/modules/inbox/captureEvents'
import { BrandLockup } from './BrandMark'
import { ThemeMenu } from './ThemeMenu'

/**
 * The bar above every page. On phones it carries the brand; on wider screens
 * the quick-capture button (Ctrl/Cmd+K). Both have sync status, theme and account.
 */
export function TopBar() {
  const { t } = useTranslation()
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center xl:max-w-4xl gap-2 px-[clamp(1rem,4vw,2.5rem)]">
        <Link to="/today" className="rounded-lg md:hidden" aria-label={t('app.name')}>
          <BrandLockup />
        </Link>
        <Button
          variant="outline"
          onClick={openCapture}
          className="hidden min-w-56 justify-start text-muted md:inline-flex"
        >
          <Plus aria-hidden />
          <span className="flex-1 text-start">{t('capture.open')}</span>
          <kbd className="rounded-md border border-border bg-subtle px-1.5 font-sans text-[0.6875rem] text-muted">
            Ctrl K
          </kbd>
        </Button>
        <div className="ms-auto flex items-center gap-1">
          <SyncIndicator compact />
          <ThemeMenu />
          <AccountButton />
        </div>
      </div>
    </header>
  )
}

/** The owner's initial when signed in; a person icon otherwise. Opens the account section. */
function AccountButton() {
  const { t } = useTranslation()
  const session = useSession()
  if (!isCloudConfigured) return null
  const email = session?.user.email
  return (
    <Link
      to="/settings"
      hash="account"
      aria-label={email ? `${t('sync.signedInAs')} ${email}` : t('sync.title')}
      className="flex size-10 items-center justify-center rounded-full hover:bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground uppercase">
        {email ? email[0] : <UserRound aria-hidden className="size-4" />}
      </span>
    </Link>
  )
}
