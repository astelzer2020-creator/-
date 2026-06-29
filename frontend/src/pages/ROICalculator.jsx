import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts'
import { Calculator, TrendingUp, DollarSign, Home, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

const PLAN_TYPES = ['תמ"א 38/1 (חיזוק)', 'תמ"א 38/2 (הריסה ובנייה)', 'פינוי-בינוי', 'עיבוי-בינוי']

const CITY_PRICES = {
  'תל אביב': { land: 45000, sale: 55000, build: 12000 },
  'חיפה': { land: 12000, sale: 18000, build: 10000 },
  'ירושלים': { land: 28000, sale: 38000, build: 11000 },
  'ראשון לציון': { land: 18000, sale: 25000, build: 10500 },
  'פתח תקווה': { land: 15000, sale: 22000, build: 10500 },
  'רמת גן': { land: 22000, sale: 32000, build: 11000 },
  'בת ים': { land: 20000, sale: 28000, build: 11000 },
  'נתניה': { land: 14000, sale: 20000, build: 10000 },
}

function Slider({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value.toLocaleString()}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-600">
        <span>{min.toLocaleString()}{unit}</span>
        <span>{max.toLocaleString()}{unit}</span>
      </div>
    </div>
  )
}

export default function ROICalculator() {
  const [city, setCity] = useState('תל אביב')
  const [planType, setPlanType] = useState(PLAN_TYPES[1])
  const [existingUnits, setExistingUnits] = useState(20)
  const [addedUnits, setAddedUnits] = useState(40)
  const [avgUnitSize, setAvgUnitSize] = useState(85)
  const [landArea, setLandArea] = useState(1000)
  const [buildCostOverride, setBuildCostOverride] = useState(null)
  const [salePriceOverride, setSalePriceOverride] = useState(null)
  const [tenantCompensation, setTenantCompensation] = useState(2500)
  const [financeRate, setFinanceRate] = useState(5)
  const [projectYears, setProjectYears] = useState(4)

  const prices = CITY_PRICES[city] || CITY_PRICES['תל אביב']
  const buildCost = buildCostOverride ?? prices.build
  const salePrice = salePriceOverride ?? prices.sale

  const calc = useMemo(() => {
    const totalNewUnits = existingUnits + addedUnits
    const revenue = addedUnits * avgUnitSize * salePrice
    const constructionCost = totalNewUnits * avgUnitSize * buildCost
    const tenantCost = existingUnits * tenantCompensation * 12 * projectYears
    const demolitionCost = planType.includes('הריסה') || planType.includes('פינוי') ? landArea * 200 : 0
    const permits = revenue * 0.035
    const finance = constructionCost * (financeRate / 100) * projectYears
    const totalCost = constructionCost + tenantCost + demolitionCost + permits + finance
    const profit = revenue - totalCost
    const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0
    const irr = roi > 0 ? (Math.pow(1 + roi / 100, 1 / projectYears) - 1) * 100 : 0
    const npv = profit / Math.pow(1 + financeRate / 100, projectYears)
    return { revenue, constructionCost, tenantCost, demolitionCost, permits, finance, totalCost, profit, roi, irr, npv, totalNewUnits }
  }, [city, existingUnits, addedUnits, avgUnitSize, landArea, buildCost, salePrice, tenantCompensation, financeRate, projectYears, planType])

  const pieData = [
    { name: 'בנייה', value: calc.constructionCost, color: '#3b82f6' },
    { name: 'שכ"ד דיירים', value: calc.tenantCost, color: '#8b5cf6' },
    { name: 'פינוי/הריסה', value: calc.demolitionCost, color: '#f59e0b' },
    { name: 'היתרים', value: calc.permits, color: '#10b981' },
    { name: 'מימון', value: calc.finance, color: '#ef4444' },
  ].filter(d => d.value > 0)

  const fmt = (n) => `₪${Math.abs(n / 1e6).toFixed(1)}M`

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">מחשבון ROI</h1>
        <p className="text-slate-400 mt-1">חישוב כדאיות כלכלית לפרויקט התחדשות עירונית</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Home size={18} className="text-blue-400" />פרמטרי פרויקט</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">עיר</label>
                <select value={city} onChange={e => setCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm">
                  {Object.keys(CITY_PRICES).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">סוג תוכנית</label>
                <select value={planType} onChange={e => setPlanType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm">
                  {PLAN_TYPES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-5">
              <Slider label="יחידות קיימות" value={existingUnits} min={4} max={200} onChange={setExistingUnits} unit=" יח'" />
              <Slider label="יחידות חדשות (תוספת)" value={addedUnits} min={0} max={400} onChange={setAddedUnits} unit=" יח'" />
              <Slider label="גודל יחידה ממוצע" value={avgUnitSize} min={40} max={200} onChange={setAvgUnitSize} unit=" מ\"ר" />
              <Slider label="שטח קרקע" value={landArea} min={200} max={10000} step={100} onChange={setLandArea} unit=" מ\"ר" />
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><DollarSign size={18} className="text-amber-400" />מחירים ומימון</h2>
            <div className="space-y-5">
              <Slider label="עלות בנייה למ\"ר" value={buildCost} min={8000} max={20000} step={500} onChange={setBuildCostOverride} unit=" ₪" />
              <Slider label="מחיר מכירה למ\"ר" value={salePrice} min={12000} max={80000} step={500} onChange={setSalePriceOverride} unit=" ₪" />
              <Slider label="שכ\"ד ממוצע לחודש לדייר" value={tenantCompensation} min={1000} max={6000} step={100} onChange={setTenantCompensation} unit=" ₪" />
              <Slider label="ריבית מימון שנתית" value={financeRate} min={2} max={12} step={0.5} onChange={setFinanceRate} unit="%" />
              <Slider label="משך הפרויקט" value={projectYears} min={1} max={10} onChange={setProjectYears} unit=" שנים" />
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300">
              <p>מחירי ברירת מחדל מבוססים על נתוני שוק עדכניים לעיר {city}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <motion.div
            key={calc.roi.toFixed(0)}
            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className={`glass rounded-2xl p-6 text-center border ${calc.roi >= 20 ? 'border-green-500/40' : calc.roi >= 10 ? 'border-amber-500/40' : 'border-red-500/40'}`}
          >
            <div className={`text-5xl font-bold mb-1 ${calc.roi >= 20 ? 'text-green-400' : calc.roi >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
              {calc.roi.toFixed(1)}%
            </div>
            <p className="text-slate-400 text-sm">תשואה על ההשקעה (ROI)</p>
            {calc.roi < 15 && (
              <div className="mt-3 flex items-center gap-2 bg-red-500/10 rounded-lg p-2">
                <AlertTriangle size={14} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-300">תשואה נמוכה — שקול לבדוק הנחות</p>
              </div>
            )}
          </motion.div>

          {[
            { label: 'הכנסות', value: fmt(calc.revenue), color: 'text-green-400' },
            { label: 'עלויות כוללות', value: fmt(calc.totalCost), color: 'text-red-400' },
            { label: 'רווח', value: fmt(calc.profit), color: calc.profit > 0 ? 'text-green-400' : 'text-red-400' },
            { label: 'IRR שנתי', value: `${calc.irr.toFixed(1)}%`, color: 'text-blue-400' },
            { label: 'NPV', value: fmt(calc.npv), color: 'text-purple-400' },
            { label: 'סה"כ יחידות חדשות', value: calc.totalNewUnits, color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-xl p-4 flex justify-between items-center">
              <span className="text-slate-400 text-sm">{label}</span>
              <span className={`font-bold ${color}`}>{value}</span>
            </div>
          ))}

          <div className="glass rounded-2xl p-4">
            <p className="text-sm font-semibold text-white mb-2">פירוט עלויות</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
