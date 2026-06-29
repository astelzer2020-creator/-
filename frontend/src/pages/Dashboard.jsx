import { motion } from 'framer-motion'
import { TrendingUp, Building2, Users, DollarSign, MapPin, ArrowUpRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useProjectStore } from '../store/projectStore'

const roiTrend = [
  { year: '2020', roi: 12 }, { year: '2021', roi: 18 }, { year: '2022', roi: 22 },
  { year: '2023', roi: 28 }, { year: '2024', roi: 35 }, { year: '2025', roi: 42 },
]

const cityData = [
  { city: 'תל אביב', projects: 45 }, { city: 'חיפה', projects: 32 },
  { city: 'ירושלים', projects: 28 }, { city: 'ראשל"צ', projects: 21 },
  { city: 'נתניה', projects: 18 }, { city: 'פ"ת', projects: 15 },
]

const stats = [
  { label: 'פרויקטים פעילים', value: '127', sub: '+12 החודש', icon: Building2, color: 'blue' },
  { label: 'ROI ממוצע', value: '38%', sub: '+5% מהשנה', icon: TrendingUp, color: 'green' },
  { label: 'דיירים מועתקים', value: '4,820', sub: 'ב-2024', icon: Users, color: 'purple' },
  { label: 'השקעה כוללת', value: '₪2.1B', sub: 'כל הפרויקטים', icon: DollarSign, color: 'amber' },
]

const colorMap = {
  blue: 'bg-blue-500/20 text-blue-400',
  green: 'bg-green-500/20 text-green-400',
  purple: 'bg-purple-500/20 text-purple-400',
  amber: 'bg-amber-500/20 text-amber-400',
}

export default function Dashboard() {
  const projects = useProjectStore((s) => s.projects)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">לוח בקרה</h1>
        <p className="text-slate-400 mt-1">סקירת מצב התחדשות עירונית בישראל</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm">{s.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{s.value}</p>
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight size={12} /> {s.sub}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${colorMap[s.color]}`}>
                <s.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">מגמת ROI לאורך זמן</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={roiTrend}>
              <defs>
                <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Area type="monotone" dataKey="roi" stroke="#3b82f6" fill="url(#roiGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">פרויקטים לפי עיר</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis type="category" dataKey="city" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} width={60} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="projects" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">פרויקטים אחרונים</h2>
          <span className="text-xs text-slate-400 glass px-3 py-1 rounded-full">{projects.length} פרויקטים</span>
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p>אין פרויקטים עדיין. ייבא נתוני תב"ע/PIO כדי להתחיל.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                <MapPin size={16} className="text-blue-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.city} · {p.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400">{p.roi}% ROI</p>
                  <p className="text-xs text-slate-400">₪{p.investment?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
