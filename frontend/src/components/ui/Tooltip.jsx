import { useState } from 'react'
import clsx from 'clsx'

export default function Tooltip({ content, children, position = 'top' }) {
  const [show, setShow] = useState(false)
  const positions = {
    top: 'bottom-full mb-2 start-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 start-1/2 -translate-x-1/2',
    start: 'end-full me-2 top-1/2 -translate-y-1/2',
    end: 'start-full ms-2 top-1/2 -translate-y-1/2',
  }
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          className={clsx(
            'absolute z-50 whitespace-nowrap rounded-lg bg-dark-900 border border-dark-600 px-2.5 py-1.5 text-xs text-text-primary shadow-card pointer-events-none',
            positions[position]
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}
