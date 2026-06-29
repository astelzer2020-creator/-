import clsx from 'clsx'

export default function Divider({ label, className }) {
  if (!label) return <hr className={clsx('border-dark-600', className)} />
  return (
    <div className={clsx('flex items-center gap-3 text-xs text-text-muted', className)}>
      <hr className="flex-1 border-dark-600" />
      {label}
      <hr className="flex-1 border-dark-600" />
    </div>
  )
}
