import clsx from 'clsx'

const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-14 h-14 text-lg' }

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export default function Avatar({ name, src, size = 'md', className }) {
  if (src) {
    return <img src={src} alt={name} className={clsx('rounded-full object-cover', sizes[size], className)} />
  }
  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-semibold',
        sizes[size],
        className
      )}
    >
      {initials(name) || '?'}
    </div>
  )
}
