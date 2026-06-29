import { useState } from 'react'
import { FileText, Download, Printer, BarChart2, TrendingUp, Building2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { useProjectStore } from '../store/projectStore'

const SENSITIVITY_DATA = [
  { label: '-20% מחיר מכירה', roi: 12 },
  { label: '-10% מחיר מכירה', roi: 24 },
  { label: 'בסיס', roi: 38 },
  { label: '+10% מחיר מכירה', roi: 52 },
  { label: '+20% מחיר מכירה', roi: 66 },
]

const CASHFLOW_DATA = [
  { year: 'ש"א', cashflow: -25, cumulative: -25 },
  { year: 'ש"ב', cashflow: -18, cumulative: -43 },
  { year: 'ש"ג', cashflow: -8, cumulative: -51 },
  { year: 'ש"ד', cashflow: 35, cumulative: -16 },
  { year: 'ש"ה', cashflow: 42, cumulative: 26 },
  { year: 'ש"ו', cashflow: 30, cumulative: 56 },
]

export default function Reports() {
  const projects = useProjectStore((s) => s.projects)
  const importedData = useProjectStore((s) => s.importedData)
  const [reportType, setReportType] = useState('summary')

  const handlePrint = () => window.print()

  const handleExport = () => {
    import('xlsx').then(({ utils, writeFile }) => {
      const wb = utils.book_new()
      const wsData = projects.map((p) => ({
        שם: p.name, עיר: p.city, סוג: p.type,
        'יח"ד קיים': p.existingUnits, 'יח"ד מוצע': p.proposedUnits,
        'ROI%': p.roi, השקעה: p.investment, סטטוס: p.status,
      }))
      utils.book_append_sheet(wb, utils.json_to_sheet(wsData), 'פרויקטים')
      writeFile(wb, 'urban-renewal-report.xlsx')
    })
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">דוחות וניתוח</h1>
          <p className="text-slate-400 mt-1">ניתוח מקיף של פרויקטי התחדשות עירונית</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white transition-colors">
            <Download size={16} /> ייצוא Excel
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm text-white transition-colors">
            <Printer size={16} /> הדפסה
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        {[
          { key: 'summary', label: 'סיכום מנהלים', icon: FileText },
          { key: 'financial', label: 'ניתוח פיננסי', icon: TrendingUp },
          { key: 'sensitivity', label: 'ניתוח רגישות', icon: BarChart2 },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setReportType(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              reportType === key ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white'
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {reportType === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'פרויקטים מיובאים', value: projects.length || 0, unit: '' },
              { label: 'רשומות מקור', value: importedData?.count || 0, unit: '' },
              { label: 'ROI ממוצע', value: projects.length ? Math.round(projects.reduce((s, p) => s + (p.roi || 0), 0) / projects.length) : 0, unit: '%' },
              { label: 'יח"ד כולל', value: projects.reduce((s, p) => s + (p.proposedUnits || 0), 0), unit: '' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="glass rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-white">{value.toLocaleString()}{unit}</p>
                <p className="text-sm text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Building2 size={18} className="text-blue-400" />רשימת פרויקטים</h2>
            {projects.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">אין פרויקטים. ייבא נתונים מעמוד ייבוא הנתונים.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {['שם', 'עיר', 'סוג', 'יח"ד קיים', 'יח"ד חדש', 'ROI', 'השקעה', 'סטטוס'].map(h => (
                        <th key={h} className="px-3 py-2 text-right text-slate-400 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                        <td className="px-3 py-2 text-white font-medium">{p.name}</td>
                        <td className="px-3 py-2 text-slate-300">{p.city}</td>
                        <td className="px-3 py-2 text-slate-300">{p.type}</td>
                        <td className="px-3 py-2 text-slate-300">{p.existingUnits}</td>
                        <td className="px-3 py-2 text-green-400">{p.proposedUnits}</td>
                        <td className="px-3 py-2 font-bold text-green-400">{p.roi}%</td>
                        <td className="px-3 py-2 text-slate-300">₪{(p.investment || 0).toLocaleString()}</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {reportType === 'financial' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">תזרים מזומנים מצטבר</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={CASHFLOW_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} unit="M₪" />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={v => `${v}M₪`} />
                <Legend />
                <Line type="monotone" dataKey="cashflow" stroke="#3b82f6" name="תזרים שנתי" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cumulative" stroke="#10b981" name="מצטבר" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {reportType === 'sensitivity' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-2">ניתוח רגישות — ROI לפי שינוי מחיר מכירה</h2>
            <p className="text-slate-400 text-sm mb-4">כיצד שינוי במחיר המכירה משפיע על התשואה הכוללת</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={SENSITIVITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={v => `${v}%`} />
                <Bar dataKey="roi" name="ROI" radius={[4, 4, 0, 0]}
                  fill="#3b82f6"
                  label={{ position: 'top', fill: '#94a3b8', fontSize: 12, formatter: v => `${v}%` }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-3">גורמי סיכון עיקריים</h3>
            <div className="space-y-3">
              {[
                { factor: 'שינוי מחיר קרקע', impact: 'גבוה', direction: 'שלילי', pct: '±15%' },
                { factor: 'עיכובים בהיתרים', impact: 'בינוני', direction: 'שלילי', pct: '±8%' },
                { factor: 'עלויות בנייה', impact: 'גבוה', direction: 'שלילי', pct: '±12%' },
                { factor: 'ריבית מימון', impact: 'בינוני', direction: 'שלילי', pct: '±6%' },
                { factor: 'ביקוש שוק', impact: 'גבוה', direction: 'חיובי', pct: '±20%' },
              ].map(({ factor, impact, direction, pct }) => (
                <div key={factor} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{factor}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${impact === 'גבוה' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>{impact}</span>
                  <span className={`text-xs font-mono ${direction === 'שלילי' ? 'text-red-400' : 'text-green-400'}`}>{pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
