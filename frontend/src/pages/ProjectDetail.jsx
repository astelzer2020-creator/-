import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin, Home, TrendingUp, DollarSign, Edit2, Save } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from 'recharts'
import { useProjectStore } from '../store/projectStore'
import { useTranslation } from '../i18n/useTranslation'
import { formatCurrency, formatPercent } from '../utils/formatters'
import { STATUS_LABELS } from '../data/mockProjects'
import { Card, Badge, Button, Tabs, Input } from '../components/ui'

const chartTooltipStyle = { background: '#0d1526', border: '1px solid #1a2744', borderRadius: 10, color: '#f1f5f9' }

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const projects = useProjectStore((s) => s.projects)
  const updateProject = useProjectStore((s) => s.updateProject)
  const { t, lang } = useTranslation()
  const [tab, setTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)

  const project = useMemo(() => projects.find((p) => String(p.id) === id), [projects, id])

  if (!project) {
    return (
      <div className="text-center py-20 text-text-muted">
        <p>Project not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/projects')}>
          {t('projects.title')}
        </Button>
      </div>
    )
  }

  const cashflowData = Array.from({ length: 5 }, (_, i) => ({
    year: `Y${i + 1}`,
    value: Math.round(((i + 1) / 5) * project.investment * (0.6 + project.roi / 100)) / 1_000_000,
  }))

  const startEdit = () => {
    setDraft({ ...project })
    setEditing(true)
  }
  const saveEdit = () => {
    updateProject(project.id, draft)
    setEditing(false)
  }

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'financials', label: 'Financials' },
    { value: 'units', label: 'Units Mix' },
    { value: 'cashflow', label: 'Cash Flow' },
    { value: 'documents', label: 'Documents' },
  ]

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm">
        <ArrowRight size={14} className="rtl:rotate-180" /> {t('projects.title')}
      </button>

      <Card>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary">{project.name}</h1>
              <Badge variant={STATUS_LABELS[project.status]?.variant}>{STATUS_LABELS[project.status]?.[lang === 'he' ? 'he' : 'en']}</Badge>
            </div>
            <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
              <MapPin size={13} /> {project.address}, {project.city} · {project.planType}
            </p>
          </div>
          {!editing ? (
            <Button variant="secondary" icon={Edit2} onClick={startEdit}>
              {t('common.edit')}
            </Button>
          ) : (
            <Button icon={Save} onClick={saveEdit}>
              {t('common.save')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Home size={16} className="text-brand-secondary" />
            <div>
              <p className="text-lg font-bold text-text-primary">{project.units}</p>
              <p className="text-xs text-text-muted">{t('common.units')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-success" />
            <div>
              <p className="text-lg font-bold text-success">{formatPercent(project.roi)}</p>
              <p className="text-xs text-text-muted">ROI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-warning" />
            <div>
              <p className="text-lg font-bold text-text-primary">{formatCurrency(project.investment, { compact: true })}</p>
              <p className="text-xs text-text-muted">{t('common.investment')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Home size={16} className="text-brand-accent" />
            <div>
              <p className="text-lg font-bold text-text-primary">{project.avgUnitSize} מ"ר</p>
              <p className="text-xs text-text-muted">Avg unit size</p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <Card>
          {editing ? (
            <div className="grid grid-cols-2 gap-4">
              <Input label={t('common.name')} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
              <Input label={t('common.units')} type="number" value={draft.units} onChange={(e) => setDraft((d) => ({ ...d, units: Number(e.target.value) }))} />
              <Input label="ROI %" type="number" value={draft.roi} onChange={(e) => setDraft((d) => ({ ...d, roi: Number(e.target.value) }))} />
              <Input label={t('common.investment')} type="number" value={draft.investment} onChange={(e) => setDraft((d) => ({ ...d, investment: Number(e.target.value) }))} />
            </div>
          ) : (
            <p className="text-text-muted text-sm">
              {project.existingUnits} existing units, {project.addedUnits} added units, avg size {project.avgUnitSize} מ"ר. Plan type: {project.planType}.
            </p>
          )}
        </Card>
      )}

      {tab === 'financials' && (
        <Card>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-dark-700/50">
              <p className="text-text-muted text-xs">Investment</p>
              <p className="text-text-primary font-semibold">{formatCurrency(project.investment)}</p>
            </div>
            <div className="p-3 rounded-xl bg-dark-700/50">
              <p className="text-text-muted text-xs">ROI</p>
              <p className="text-success font-semibold">{formatPercent(project.roi)}</p>
            </div>
            <div className="p-3 rounded-xl bg-dark-700/50">
              <p className="text-text-muted text-xs">Estimated profit</p>
              <p className="text-text-primary font-semibold">{formatCurrency(project.investment * (project.roi / 100))}</p>
            </div>
          </div>
        </Card>
      )}

      {tab === 'units' && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-start">
                <th className="text-start py-2">Type</th>
                <th className="text-start py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-dark-600">
                <td className="py-2 text-text-primary">Existing</td>
                <td className="py-2 text-text-primary">{project.existingUnits}</td>
              </tr>
              <tr className="border-t border-dark-600">
                <td className="py-2 text-text-primary">Added</td>
                <td className="py-2 text-text-primary">{project.addedUnits}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'cashflow' && (
        <Card>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={cashflowData}>
              <defs>
                <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <RTooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#cfGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {tab === 'documents' && (
        <Card>
          <p className="text-text-muted text-sm text-center py-8">No documents uploaded yet.</p>
        </Card>
      )}
    </div>
  )
}
