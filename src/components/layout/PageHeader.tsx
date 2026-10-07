import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  /** One calm sentence under the title. */
  intro?: ReactNode
  /** A link or button shown at the end of the title row (e.g. "Goals"). */
  action?: ReactNode
  /** Something small above the title, such as a "back" link. */
  eyebrow?: ReactNode
}

/** The same title block at the top of every screen, so pages feel like one app. */
export function PageHeader({ title, intro, action, eyebrow }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-1.5">
      {eyebrow}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h1 className="text-2xl">{title}</h1>
        {action}
      </div>
      {intro && <p className="max-w-prose text-sm text-muted sm:text-base">{intro}</p>}
    </header>
  )
}
