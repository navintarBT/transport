import type { ReactNode, ButtonHTMLAttributes } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}>
      {children}
    </div>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base =
    'inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:-translate-y-0 active:scale-[0.98]'
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-b from-[#635BFF] to-[#4338CA] text-white shadow-md shadow-primary/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30',
    secondary:
      'border border-border bg-surface text-ink/80 shadow-sm hover:-translate-y-0.5 hover:border-ink/15 hover:bg-bg hover:shadow-md',
    ghost: 'text-primary hover:bg-primary-tint',
    danger: 'border border-danger/30 bg-surface text-danger shadow-sm hover:-translate-y-0.5 hover:bg-danger/5 hover:shadow-md',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function EmptyState({ icon, message }: { icon?: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      {icon && <span className="text-muted/50">{icon}</span>}
      <p className="text-sm text-muted">{message}</p>
    </div>
  )
}

export function StatusBadge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: `${color}1A`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {action}
    </div>
  )
}
