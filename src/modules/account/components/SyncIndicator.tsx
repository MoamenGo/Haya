import { Link } from '@tanstack/react-router'
import { CloudAlert, CloudCheck, CloudOff, RefreshCw, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { isCloudConfigured } from '@/core/auth/client'
import type { SyncPhase } from '@/core/sync/status'
import { cn } from '@/lib/utils'
import { useSyncStatus } from '../hooks'

const ICONS: Record<SyncPhase, LucideIcon> = {
  signed_out: CloudOff,
  offline: CloudOff,
  syncing: RefreshCw,
  synced: CloudCheck,
  error: CloudAlert,
}

/**
 * Small "synced ✓ / syncing / offline / error" badge. Tapping it opens the
 * account section. `compact` shows the icon only (the top bar), with the
 * status still in its accessible name and tooltip.
 */
export function SyncIndicator({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const { t } = useTranslation()
  const { phase } = useSyncStatus()
  if (!isCloudConfigured) return null
  const Icon = ICONS[phase]
  const label = t(`sync.phase.${phase}`)
  return (
    <Link
      to="/settings"
      hash="account"
      title={compact ? label : undefined}
      aria-label={compact ? label : undefined}
      className={cn(
        'inline-flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-sm text-muted transition-colors hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring',
        phase === 'error' && 'text-danger',
        compact && 'size-10 justify-center px-0',
        className,
      )}
    >
      <Icon
        aria-hidden
        className={cn('size-[1.125rem]', phase === 'syncing' && 'motion-safe:animate-spin')}
      />
      {!compact && <span>{label}</span>}
    </Link>
  )
}
