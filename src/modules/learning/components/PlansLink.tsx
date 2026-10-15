import { Link } from '@tanstack/react-router'
import { ChevronRight, GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * The way from Today to the learning plans: a full row with an icon, the
 * number of active plans and an arrow, so it reads as a place to go (and
 * edit), not as a footnote. The arrow flips in Arabic to point "forward".
 */
export function PlansLink({ activePlans }: { activePlans: number }) {
  const { t } = useTranslation()
  return (
    <Link
      to="/learn"
      className="group flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-surface p-3 pe-4 shadow-card transition-[border-color,background-color,transform] duration-150 hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.99]"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary ring-1 ring-primary/15">
        <GraduationCap aria-hidden className="size-5" strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-display font-medium">{t('today.openPlans')}</span>
        <span className="text-xs text-muted">{t('today.plansHint', { count: activePlans })}</span>
      </span>
      <ChevronRight
        aria-hidden
        className="size-5 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
      />
    </Link>
  )
}
