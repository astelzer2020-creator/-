import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2,
  TrendingUp,
  DollarSign,
  Home,
  Briefcase,
  Activity,
  Plus,
  Upload,
  FileText,
  MapPin,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import { useProjectStore } from '../store/projectStore'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/useTranslation'
import { formatCurrency, formatPercent, formatDate, formatNumber } from '../utils/formatters'
import { Card, Button, Badge } from '../components/ui'
import { STATUS_LABELS } from '../data/mockProjects'

const STATUS_COLORS = {
  planning: '#64748b',
  approved: '#06b6d4',
  in_progress: '#f59e0b',
  completed: '#10b981',
}

const chartTooltipStyle = { background: '#0d1526', border: '1px solid #1a2744', borderRadius: 10, color: '#f1f5f9' }

export default function Dashboard() {
  const projects = useProjectStore((s) => s.projects)
  const { user } = useAuth()
  const { t, lang } = useTranslation()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const total = projects.length
    const active = projects.filter((p) => p.status === 'in_progress' || p.status === 'approved').length
    const totalInvestment = projects.reduce((s, p) => s + p.investment, 0) / 1_000_000
    const avgRoi = total ? projects.reduce((s, p) => s + p.roi, 0) / total : 0
    const totalUnits = projects.reduce((s, p) => s + p.units, 0)
    const pipelineValue =
      projects.filter((p) => p.status === 'planning' || p.status === 'approved').reduce((s, p) => s + p.investment, 0) /
      1_000_000

    return [
      { label: t('dashboard.totalProjects'), value: formatNumber(total), icon: Building2, color: 'text-brand-primary', bg: 'bg-brand-primary/15' },
      { label: t('dashboard.activeProjects'), value: formatNumber(active), icon: Activity, color: 'text-brand-accent', bg: 'bg-brand-accent/15' },
      { label: t('dashboard.totalInvestment'), value: formatNumber(totalInvestment, 1), icon: DollarSign, color: 'text-success', bg: 'bg-success/15' },
      { label: t('dashboard.avgRoi'), value: formatPercent(avgRoi), icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/15' },
      { label: t('dashboard.totalUnits'), value: formatNumber(totalUnits), icon: Home, color: 'text-brand-secondary', bg: 'bg-brand-secondary/15' },
      { label: t('dashboard.pipelineValue'), value: formatNumber(pipelineValue, 1), icon: Briefcase, color: 'text-danger', bg: 'bg-danger/15' },
    ]
  }, [projects, t])

  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [projects]
  )

  const roiDistribution = useMemo(() => {
    const buckets = [
      { range: '0-10%', min: 0, max: 10 },
      { range: '10-20%', min: 10, max: 20 },
      { range: '20-30%', min: 20, max: 30 },
      { range: '30-40%', min: 30, max: 40 },
      { range: '40%+', min: 40, max: Infinity },
    ]
    return buckets.map((b) => ({
      range: b.range,
      count: projects.filter((p) => p.roi >= b.min && p.roi < b.max).length,
    }))
  }, [projects])

  const statusDistribution = useMemo(() => {
    const counts = {}
    projects.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      status,
      label: STATUS_LABELS[status]?.[lang === 'he' ? 'he' : 'en'] || status,
      count,
    }))
  }, [projects, lang])

  const monthlyPipeline = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({ month: i, value: 0 }))
    projects.forEach((p) => {
      const m = new Date(p.createdAt).getMonth()
      months[m].value += p.investment / 1_000_000
    })
    const monthNames =
      lang === 'he'
        ? ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((m) => ({ month: monthNames[m.month], value: Math.round(m.value * 10) / 10 }))
  }, [projects, lang])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10"
      >
        <h1 className="text-2xl font-bold text-text-primary">
          {t('dashboard.welcome')}, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-text-muted mt-1">{formatDate(new Date(), 'EEEE, dd MMMM yyyy')}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="h-full">
              <div className={`inline-flex p-2.5 rounded-xl ${s.bg} ${s.color} mb-3`}>
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-text-primary">{s.value}</p>
              <p className="text-xs text-text-muted mt-1">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button icon={Plus} onClick={() => navigate('/projects')}>
          {t('dashboard.newProject')}
        </Button>
        <Button variant="secondary" icon={Upload} onClick={() => navigate('/import')}>
          {t('dashboard.importData')}
        </Button>
        <Button variant="ghost" icon={FileText} onClick={() => navigate('/reports')}>
          {t('dashboard.generateReport')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card header={<h2 className="font-semibold text-text-primary">{t('dashboard.roiDistribution')}</h2>}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roiDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" />
              <XAxis dataKey="range" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <RTooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card header={<h2 className="font-semibold text-text-primary">{t('dashboard.statusDistribution')}</h2>}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusDistribution} dataKey="count" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {statusDistribution.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Pie>
              <RTooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card header={<h2 className="font-semibold text-text-primary">{t('dashboard.monthlyPipeline')}</h2>}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyPipeline}>
              <defs>
                <linearGradient id="pipelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <RTooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#pipelineGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card header={<h2 className="font-semibold text-text-primary">{t('dashboard.recentProjects')}</h2>}>
        <div className="space-y-2">
          {recentProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate('/projects')}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-700/40 transition-colors cursor-pointer"
            >
              <MapPin size={16} className="text-brand-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                <p className="text-xs text-text-muted truncate">{p.city} · {p.planType}</p>
              </div>
              <Badge variant={STATUS_LABELS[p.status]?.variant || 'neutral'}>
                {STATUS_LABELS[p.status]?.[lang === 'he' ? 'he' : 'en']}
              </Badge>
              <div className="text-end shrink-0 w-24">
                <p className="text-sm font-bold text-success">{formatPercent(p.roi)}</p>
                <p className="text-xs text-text-muted">{formatCurrency(p.investment, { compact: true })}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
