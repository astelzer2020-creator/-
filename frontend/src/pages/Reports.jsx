import { useState } from 'react'
import { FileText, Download, FileSpreadsheet, MapPin, TrendingUp, Home } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProjectStore } from '../store/projectStore'
import { useTranslation } from '../i18n/useTranslation'
import { formatCurrency, formatPercent } from '../utils/formatters'
import { exportProjectToExcel } from '../utils/export'
import { STATUS_LABELS } from '../data/mockProjects'
import { Card, Button, Badge } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

export default function Reports() {
  const projects = useProjectStore((s) => s.projects)
  const { t, lang } = useTranslation()
  const [exporting, setExporting] = useState(false)

  const handleExcelExport = async () => {
    setExporting(true)
    try {
      await exportProjectToExcel(projects)
      toast.success('Excel exported')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handlePDFExport = async () => {
    setExporting(true)
    toast('Generating PDF...')
    try {
      const { exportToPDF } = await import('../utils/export')
      await exportToPDF('reports-content', 'urban-renewal-report')
      toast.success('PDF downloaded')
    } catch {
      toast.error('PDF generation failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.reports')}
        breadcrumb={[{ label: t('nav.dashboard'), to: '/dashboard' }, { label: t('nav.reports') }]}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={FileSpreadsheet} loading={exporting} onClick={handleExcelExport}>
              Excel
            </Button>
            <Button icon={FileText} loading={exporting} onClick={handlePDFExport}>
              PDF
            </Button>
          </div>
        }
      />

      <div id="reports-content" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-text-muted mb-1">סך פרויקטים</p>
            <p className="text-3xl font-bold text-text-primary">{projects.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-text-muted mb-1">סך השקעה</p>
            <p className="text-3xl font-bold text-brand-primary">
              {formatCurrency(projects.reduce((s, p) => s + p.investment, 0), { compact: true })}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-text-muted mb-1">תשואה ממוצעת</p>
            <p className="text-3xl font-bold text-success">
              {formatPercent(projects.reduce((s, p) => s + p.roi, 0) / (projects.length || 1), 1)}
            </p>
          </Card>
        </div>

        <Card header={<h2 className="font-semibold text-text-primary">רשימת פרויקטים</h2>}>
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-700/40 border border-dark-600/50">
                <MapPin size={16} className="text-brand-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                  <p className="text-xs text-text-muted truncate">{p.city} · {p.planType}</p>
                </div>
                <Badge variant={STATUS_LABELS[p.status]?.variant || 'neutral'}>
                  {STATUS_LABELS[p.status]?.[lang === 'he' ? 'he' : 'en']}
                </Badge>
                <div className="flex items-center gap-1 text-text-muted text-sm">
                  <Home size={14} /> {p.units}
                </div>
                <div className="text-end shrink-0 w-28">
                  <p className="text-sm font-bold text-success">{formatPercent(p.roi)}</p>
                  <p className="text-xs text-text-muted">{formatCurrency(p.investment, { compact: true })}</p>
                </div>
                <button
                  onClick={async () => {
                    toast('Generating PDF...')
                    const { exportToPDF } = await import('../utils/export')
                    await exportToPDF(`project-${p.id}`, `project-${p.id}`)
                  }}
                  className="text-text-muted hover:text-brand-primary transition-colors"
                  title="Export PDF"
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
