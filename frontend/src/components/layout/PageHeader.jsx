import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PageHeader({ title, breadcrumb = [], actions }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {b.to ? (
                  <Link to={b.to} className="hover:text-text-primary transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span>{b.label}</span>
                )}
                {i < breadcrumb.length - 1 && <ChevronRight size={12} className="rtl:rotate-180" />}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
