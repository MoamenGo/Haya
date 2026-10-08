import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Same pattern as shadcn/ui's Button: variants are declared once with `cva`.
// Heights: 44px on phones (thumb size), 40px from the `md` breakpoint up.
const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,0_6px_16px_-8px_var(--primary)] hover:bg-primary-strong',
        outline:
          'border border-border bg-surface text-foreground hover:border-border-strong hover:bg-subtle',
        ghost: 'text-muted hover:bg-subtle hover:text-foreground',
        danger:
          'border border-border bg-surface text-danger hover:border-danger/40 hover:bg-danger-soft',
      },
      size: {
        md: 'min-h-11 px-4 md:min-h-10',
        sm: 'min-h-9 gap-1.5 px-3 text-sm md:min-h-8 [&_svg]:size-3.5',
        icon: 'size-11 md:size-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}
