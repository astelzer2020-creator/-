import clsx from 'clsx'

const colors = {
  primary: 'bg-brand-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

export default function Progress({ value = 0, color = 'primary', className, showLabel = false }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={clsx('w-full', className)}>
      <div className="h-2 rounded-full bg-dark-600 overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-300', colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <p className="mt-1 text-xs text-text-muted">{pct.toFixed(0)}%</p>}
    </div>
  )
}
