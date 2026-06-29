import { Listbox } from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'
import clsx from 'clsx'

export default function Select({ label, options, value, onChange, placeholder = 'Select...', className }) {
  const selected = options.find((o) => o.value === value)
  return (
    <div className={clsx('w-full', className)}>
      {label && <label className="block text-xs font-medium text-text-muted mb-1.5">{label}</label>}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="w-full flex items-center justify-between rounded-xl bg-dark-700 border border-dark-600 text-text-primary px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30">
            <span className={clsx(!selected && 'text-text-muted')}>{selected ? selected.label : placeholder}</span>
            <ChevronDown size={16} className="text-text-muted" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl bg-dark-800 border border-dark-600 shadow-card py-1 outline-none">
            {options.map((opt) => (
              <Listbox.Option
                key={opt.value}
                value={opt.value}
                className={({ active }) =>
                  clsx(
                    'flex items-center justify-between px-4 py-2 text-sm cursor-pointer',
                    active ? 'bg-brand-primary/20 text-white' : 'text-slate-300'
                  )
                }
              >
                {({ selected: isSel }) => (
                  <>
                    <span>{opt.label}</span>
                    {isSel && <Check size={14} className="text-brand-primary" />}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  )
}
