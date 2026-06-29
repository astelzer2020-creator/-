import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-brand-primary text-white hover:bg-indigo-500 shadow-glow border border-transparent',
  secondary: 'bg-dark-600 text-text-primary hover:bg-dark-500 border border-dark-500',
  ghost: 'bg-transparent text-slate-300 hover:bg-dark-700 border border-transparent',
  danger: 'bg-danger text-white hover:bg-red-500 border border-transparent',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </button>
  )
}
