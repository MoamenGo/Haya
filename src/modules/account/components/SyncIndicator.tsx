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

/** Small "synced ✓ / syncing / offline / error" badge. Tapping it opens the account section. */
export function SyncIndicator({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { phase } = useSyncStatus()
  if (!isCloudConfigured) return null
  const Icon = ICONS[phase]
  return (
    <Link
      to="/settings"
      hash="account"
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-muted hover:bg-accent',
        className,
      )}
    >
      <Icon
        aria-hidden
        className={cn('size-5', phase === 'syncing' && 'motion-safe:animate-spin')}
      />
      <span>{t(`sync.phase.${phase}`)}</span>
    </Link>
  )
}
