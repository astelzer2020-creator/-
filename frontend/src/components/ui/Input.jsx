import { forwardRef } from 'react'
import clsx from 'clsx'

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className, containerClassName, type = 'text', unit, ...props },
  ref
) {
  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && <label className="block text-xs font-medium text-text-muted mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 start-3 flex items-center text-text-muted">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'w-full rounded-xl bg-dark-700 border border-dark-600 text-text-primary placeholder:text-text-muted px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30',
            Icon && 'ps-9',
            unit && 'pe-12',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className
          )}
          {...props}
        />
        {unit && (
          <span className="absolute inset-y-0 end-3 flex items-center text-text-muted text-xs">{unit}</span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
})

export default Input
