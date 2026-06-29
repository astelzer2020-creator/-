import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Plus, LayoutGrid, List, MapPin, Home, TrendingUp } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import { useTranslation } from '../i18n/useTranslation'
import { formatCurrency, formatPercent } from '../utils/formatters'
import { PLAN_TYPES } from '../utils/calculations'
import { CITY_NAMES } from '../data/cityPrices'
import { STATUS_LABELS } from '../data/mockProjects'
import PageHeader from '../components/layout/PageHeader'
import { Card, Badge, Button, Input, Select, Modal, Table } from '../components/ui'
import toast from 'react-hot-toast'

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'roi', label: 'ROI' },
  { value: 'units', label: 'Units' },
  { value: 'investment', label: 'Investment' },
]

export default function Projects() {
  const projects = useProjectStore((s) => s.projects)
  const addProject = useProjectStore((s) => s.addProject)
  const { t, lang } = useTranslation()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [view, setView] = useState('grid')
  const [sortBy, setSortBy] = useState('date')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', city: CITY_NAMES[0], planType: PLAN_TYPES[0], units: 50, investment: 10000000, roi: 18 })

  const filtered = useMemo(() => {
    let list = projects.filter((p) => {
      if (search && !`${p.name} ${p.address} ${p.city}`.toLowerCase().includes(search.toLowerCase())) return false
      if (cityFilter && p.city !== cityFilter) return false
      if (statusFilter && p.status !== statusFilter) return false
      if (planFilter && p.planType !== planFilter) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'roi') return b.roi - a.roi
      if (sortBy === 'units') return b.units - a.units
      if (sortBy === 'investment') return b.investment - a.investment
      return 0
    })
    return list
  }, [projects, search, cityFilter, statusFilter, planFilter, sortBy])

  const handleCreate = () => {
    addProject({
      ...form,
      address: `${form.city} - ${form.name}`,
      status: 'planning',
      existingUnits: Math.round(form.units * 0.4),
      addedUnits: Math.round(form.units * 0.6),
      avgUnitSize: 80,
    })
    toast.success('Project created')
    setShowCreate(false)
    setForm({ name: '', city: CITY_NAMES[0], planType: PLAN_TYPES[0], units: 50, investment: 10000000, roi: 18 })
  }

  const columns = [
    { key: 'name', label: t('common.name'), sortable: true },
    { key: 'city', label: t('common.city'), sortable: true },
    {
      key: 'status',
      label: t('common.status'),
      render: (row) => (
        <Badge variant={STATUS_LABELS[row.status]?.variant || 'neutral'}>
          {STATUS_LABELS[row.status]?.[lang === 'he' ? 'he' : 'en']}
        </Badge>
      ),
    },
    { key: 'units', label: t('common.units'), sortable: true },
    { key: 'roi', label: 'ROI', sortable: true, render: (row) => formatPercent(row.roi) },
    { key: 'investment', label: t('common.investment'), sortable: true, render: (row) => formatCurrency(row.investment, { compact: true }) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('projects.title')}
        actions={
          <Button icon={Plus} onClick={() => setShowCreate(true)}>
            {t('projects.newProject')}
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Input
            containerClassName="flex-1 min-w-[220px]"
            icon={Search}
            placeholder={t('projects.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            className="w-44"
            placeholder={t('common.city')}
            value={cityFilter}
            onChange={setCityFilter}
            options={[{ value: '', label: t('common.all') }, ...CITY_NAMES.map((c) => ({ value: c, label: c }))]}
          />
          <Select
            className="w-44"
            placeholder={t('common.status')}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: t('common.all') },
              ...Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: v[lang === 'he' ? 'he' : 'en'] })),
            ]}
          />
          <Select
            className="w-44"
            placeholder={t('projects.planType')}
            value={planFilter}
            onChange={setPlanFilter}
            options={[{ value: '', label: t('common.all') }, ...PLAN_TYPES.map((p) => ({ value: p, label: p }))]}
          />
          <Select className="w-40" placeholder={t('projects.sortBy')} value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
          <div className="flex items-center gap-1 bg-dark-700 rounded-xl p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg ${view === 'grid' ? 'bg-brand-primary text-white' : 'text-text-muted'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${view === 'list' ? 'bg-brand-primary text-white' : 'text-text-muted'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </Card>

      {view === 'list' ? (
        <Card>
          <Table columns={columns} data={filtered} pageSize={10} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card hover className="cursor-pointer h-full" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-text-primary">{p.name}</h3>
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {p.address}, {p.city}
                    </p>
                  </div>
                  <Badge variant={STATUS_LABELS[p.status]?.variant || 'neutral'}>
                    {STATUS_LABELS[p.status]?.[lang === 'he' ? 'he' : 'en']}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted mb-3">{p.planType}</p>
                <div className="flex items-center justify-between border-t border-dark-600 pt-3">
                  <div className="flex items-center gap-1.5 text-text-muted text-sm">
                    <Home size={14} /> {p.units}
                  </div>
                  <div className="flex items-center gap-1.5 text-success font-bold text-sm">
                    <TrendingUp size={14} /> {formatPercent(p.roi)}
                  </div>
                  <span className="text-sm text-text-primary font-medium">{formatCurrency(p.investment, { compact: true })}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('projects.newProject')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate}>{t('common.save')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label={t('common.name')} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Select
            label={t('common.city')}
            value={form.city}
            onChange={(v) => setForm((f) => ({ ...f, city: v }))}
            options={CITY_NAMES.map((c) => ({ value: c, label: c }))}
          />
          <Select
            label={t('projects.planType')}
            value={form.planType}
            onChange={(v) => setForm((f) => ({ ...f, planType: v }))}
            options={PLAN_TYPES.map((p) => ({ value: p, label: p }))}
          />
          <Input
            label={t('common.units')}
            type="number"
            value={form.units}
            onChange={(e) => setForm((f) => ({ ...f, units: Number(e.target.value) }))}
          />
          <Input
            label={t('common.investment')}
            type="number"
            unit="₪"
            value={form.investment}
            onChange={(e) => setForm((f) => ({ ...f, investment: Number(e.target.value) }))}
          />
        </div>
      </Modal>
    </div>
  )
}
