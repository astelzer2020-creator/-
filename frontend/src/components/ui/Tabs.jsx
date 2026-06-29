import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={clsx('flex items-center gap-1 border-b border-dark-600 overflow-x-auto', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
            active === tab.value ? 'text-text-primary' : 'text-text-muted hover:text-slate-300'
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            {tab.icon && <tab.icon size={15} />}
            {tab.label}
          </span>
          {active === tab.value && (
            <motion.div
              layoutId="tabs-underline"
              className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-primary rounded-full"
            />
          )}
        </button>
      ))}
    </div>
  )
}
