import type { ReactNode, ButtonHTMLAttributes } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface shadow-sm transition-shadow duration-200 ${className}`}>
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
    'inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95'
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-b from-[#635BFF] to-[#4338CA] text-white shadow-md shadow-primary/25 active:shadow-sm',
    secondary: 'border border-border bg-surface text-ink/80 shadow-sm active:bg-bg',
    ghost: 'text-primary active:bg-primary-tint',
    danger: 'border border-danger/30 bg-surface text-danger shadow-sm active:bg-danger/5',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function EmptyState({ icon, message }: { icon?: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
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
