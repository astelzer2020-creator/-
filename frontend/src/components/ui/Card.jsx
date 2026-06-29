import clsx from 'clsx'

export default function Card({ header, footer, children, className, bodyClassName, hover = false }) {
  return (
    <div
      className={clsx(
        'glass rounded-2xl shadow-card overflow-hidden',
        hover && 'transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-glow',
        className
      )}
    >
      {header && <div className="px-5 py-4 border-b border-dark-600">{header}</div>}
      <div className={clsx('p-5', bodyClassName)}>{children}</div>
      {footer && <div className="px-5 py-4 border-t border-dark-600 bg-dark-900/30">{footer}</div>}
    </div>
  )
}
