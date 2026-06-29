import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, DollarSign, PieChart as PieIcon, BarChart2, Layers, Save, Download, Trash2, Plus } from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import toast from 'react-hot-toast'
import { CITY_PRICES, CITY_NAMES } from '../data/cityPrices'
import {
  UNIT_TYPES,
  PLAN_TYPES,
  calcProjectFinancials,
  buildCashflows,
  calcIRR,
  calcNPV,
  calcPaybackPeriod,
  buildYearlyCashflowTable,
  calcSensitivityGrid,
  calcBuildingRights,
} from '../utils/calculations'
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters'
import { useProjectStore } from '../store/projectStore'
import { Card, Button, Input, Select, Tabs, Badge } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

const chartTooltipStyle = { background: '#0d1526', border: '1px solid #1a2744', borderRadius: 10, color: '#f1f5f9' }

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16']

const DEFAULT_UNIT_MIX = UNIT_TYPES.map((u, i) => ({
  ...u,
  count: [0, 2, 8, 6, 3, 1][i] ?? 0,
  pricePerSqm: 25000,
}))

function SliderRow({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-text-muted">{label}</span>
        <span className="text-text-primary font-semibold">{value.toLocaleString()}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
      />
    </div>
  )
}

function ResultMetric({ label, value, sub, color = 'text-text-primary' }) {
  return (
    <div className="p-4 rounded-2xl bg-dark-700/50 border border-dark-600">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  )
}

export default function ROICalculator() {
  const { saveScenario, scenarios, removeScenario } = useProjectStore()
  const [tab, setTab] = useState('inputs')

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
  const [parkingUnderground, setParkingUnderground] = useState(20)
  const [parkingAbove, setParkingAbove] = useState(0)
  const [commercialArea, setCommercialArea] = useState(0)
  const [commercialRentPerSqm, setCommercialRentPerSqm] = useState(100)
  const [unitMix, setUnitMix] = useState(DEFAULT_UNIT_MIX)

  const [existingRights, setExistingRights] = useState(1.2)
  const [proposedRights, setProposedRights] = useState(3.0)

  const prices = CITY_PRICES[city] || CITY_PRICES['תל אביב']
  const buildCost = buildCostOverride ?? prices.build
  const salePrice = salePriceOverride ?? prices.sale

  const syncedMix = useMemo(() =>
    unitMix.map((u) => ({ ...u, pricePerSqm: u.pricePerSqm === 25000 ? salePrice : u.pricePerSqm })),
    [unitMix, salePrice]
  )

  const totalNewUnits = addedUnits
  const weightedAvgSize = useMemo(() => {
    const totalCount = syncedMix.reduce((s, u) => s + u.count, 0)
    if (!totalCount) return avgUnitSize
    return Math.round(syncedMix.reduce((s, u) => s + u.count * u.size, 0) / totalCount)
  }, [syncedMix, avgUnitSize])

  const financials = useMemo(
    () =>
      calcProjectFinancials({
        planType,
        unitMix: syncedMix,
        commercialArea,
        commercialRentPerSqm,
        totalNewUnits,
        avgUnitSize: weightedAvgSize,
        buildCost,
        parkingUnderground,
        parkingAbove,
        existingUnits,
        tenantCompensation,
        projectYears,
        landArea,
        financeRate,
      }),
    [planType, syncedMix, commercialArea, commercialRentPerSqm, totalNewUnits, weightedAvgSize, buildCost, parkingUnderground, parkingAbove, existingUnits, tenantCompensation, projectYears, landArea, financeRate]
  )

  const cashflows = useMemo(() => buildCashflows(financials.totalCost, financials.revenue, projectYears), [financials, projectYears])
  const irr = useMemo(() => calcIRR(cashflows), [cashflows])
  const npv = useMemo(() => calcNPV(cashflows, financeRate), [cashflows, financeRate])
  const payback = useMemo(() => calcPaybackPeriod(cashflows), [cashflows])
  const cashflowTable = useMemo(() => buildYearlyCashflowTable(financials, projectYears), [financials, projectYears])
  const sensitivityGrid = useMemo(() => calcSensitivityGrid({ planType, unitMix: syncedMix, commercialArea, commercialRentPerSqm, totalNewUnits, avgUnitSize: weightedAvgSize, buildCost, parkingUnderground, parkingAbove, existingUnits, tenantCompensation, projectYears, landArea, financeRate }, [-20, 0, 20]), [financials, buildCost, syncedMix])
  const buildingRights = useMemo(() => calcBuildingRights(landArea, existingRights, proposedRights), [landArea, existingRights, proposedRights])

  const roiColor = financials.roi >= 25 ? 'text-success' : financials.roi >= 15 ? 'text-warning' : 'text-danger'

  const costBreakdown = [
    { name: 'בנייה', value: financials.constructionCost },
    { name: 'דיירים', value: financials.tenantCost },
    { name: 'הריסה', value: financials.demolitionCost },
    { name: 'אגרות', value: financials.permits },
    { name: 'השבחה', value: financials.bettermentLevy },
    { name: 'שיווק', value: financials.marketing },
    { name: 'מימון', value: financials.finance },
    { name: 'תקורה', value: financials.overhead },
  ].filter((c) => c.value > 0)

  const tabs = [
    { value: 'inputs', label: 'נתונים', icon: Calculator },
    { value: 'mix', label: 'מיקס דירות', icon: Layers },
    { value: 'cashflow', label: 'תזרים', icon: BarChart2 },
    { value: 'sensitivity', label: 'רגישות', icon: TrendingUp },
    { value: 'scenarios', label: 'תרחישים', icon: PieIcon },
    { value: 'rights', label: 'זכויות בנייה', icon: DollarSign },
  ]

  const updateUnitMix = (key, field, value) =>
    setUnitMix((prev) => prev.map((u) => (u.key === key ? { ...u, [field]: Number(value) } : u)))

  const handleSaveScenario = () => {
    saveScenario({ city, planType, financials, roi: financials.roi, label: `${city} – ${planType}` })
    toast.success('תרחיש נשמר')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="מחשבון ROI" breadcrumb={[{ label: 'לוח בקרה', to: '/dashboard' }, { label: 'מחשבון ROI' }]} />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {tab === 'inputs' && (
            <>
              <Card header={<h2 className="font-semibold text-text-primary">פרמטרים כלליים</h2>}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Select
                    label="עיר"
                    value={city}
                    onChange={(v) => { setCity(v); setBuildCostOverride(null); setSalePriceOverride(null) }}
                    options={CITY_NAMES.map((c) => ({ value: c, label: c }))}
                  />
                  <Select
                    label="סוג תוכנית"
                    value={planType}
                    onChange={setPlanType}
                    options={PLAN_TYPES.map((p) => ({ value: p, label: p }))}
                  />
                </div>
                <div className="space-y-4">
                  <SliderRow label="יחידות קיימות" value={existingUnits} min={1} max={200} onChange={setExistingUnits} unit=" יח'" />
                  <SliderRow label="יחידות חדשות" value={addedUnits} min={1} max={300} onChange={setAddedUnits} unit=" יח'" />
                  <SliderRow label="גודל יחידה ממוצע" value={avgUnitSize} min={30} max={200} onChange={setAvgUnitSize} unit={' מ"ר'} />
                  <SliderRow label={'שטח מגרש'} value={landArea} min={200} max={10000} step={50} onChange={setLandArea} unit={' מ"ר'} />
                  <SliderRow label="מספר קומות נוספות" value={projectYears} min={1} max={10} onChange={setProjectYears} unit=" שנים" />
                </div>
              </Card>
              <Card header={<h2 className="font-semibold text-text-primary">מחירים ומימון</h2>}>
                <div className="space-y-4">
                  <SliderRow label={'עלות בנייה למ"ר'} value={buildCost} min={8000} max={20000} step={500} onChange={setBuildCostOverride} unit=" ₪" />
                  <SliderRow label={'מחיר מכירה למ"ר'} value={salePrice} min={12000} max={80000} step={500} onChange={setSalePriceOverride} unit=" ₪" />
                  <SliderRow label={'שכ"ד ממוצע לחודש'} value={tenantCompensation} min={1000} max={6000} step={100} onChange={setTenantCompensation} unit=" ₪" />
                  <SliderRow label="ריבית מימון שנתית" value={financeRate} min={2} max={12} step={0.5} onChange={setFinanceRate} unit="%" />
                  <SliderRow label="משך הפרויקט" value={projectYears} min={1} max={10} onChange={setProjectYears} unit=" שנים" />
                  <SliderRow label="חניות תת-קרקעיות" value={parkingUnderground} min={0} max={200} onChange={setParkingUnderground} />
                  <SliderRow label="חניות עיליות" value={parkingAbove} min={0} max={100} onChange={setParkingAbove} />
                </div>
              </Card>
              <Card header={<h2 className="font-semibold text-text-primary">מסחר (אופציונלי)</h2>}>
                <div className="space-y-4">
                  <SliderRow label={'שטח מסחר (מ"ר)'} value={commercialArea} min={0} max={5000} step={50} onChange={setCommercialArea} unit={' מ"ר'} />
                  <SliderRow label={'שכירות מסחרית למ"ר/חודש'} value={commercialRentPerSqm} min={50} max={400} step={10} onChange={setCommercialRentPerSqm} unit=" ₪" />
                </div>
              </Card>
            </>
          )}

          {tab === 'mix' && (
            <Card header={<h2 className="font-semibold text-text-primary">מיקס דירות</h2>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted text-start">
                      <th className="text-start pb-2">סוג</th>
                      <th className="text-start pb-2">{'גודל (מ"ר)'}</th>
                      <th className="text-start pb-2">כמות</th>
                      <th className="text-start pb-2">{'מחיר למ"ר (₪)'}</th>
                      <th className="text-start pb-2">סה"כ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitMix.map((u) => (
                      <tr key={u.key} className="border-t border-dark-600">
                        <td className="py-2 text-text-primary">{u.label}</td>
                        <td className="py-2 text-text-muted">{u.size}</td>
                        <td className="py-2">
                          <input
                            type="number" min={0} max={200}
                            value={u.count}
                            onChange={(e) => updateUnitMix(u.key, 'count', e.target.value)}
                            className="w-16 rounded-lg bg-dark-700 border border-dark-600 text-text-primary text-center px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number" min={1000}
                            value={u.pricePerSqm}
                            onChange={(e) => updateUnitMix(u.key, 'pricePerSqm', e.target.value)}
                            className="w-24 rounded-lg bg-dark-700 border border-dark-600 text-text-primary px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="py-2 text-text-primary font-medium">
                          {formatCurrency(u.count * u.size * u.pricePerSqm, { compact: true })}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-brand-primary/40">
                      <td className="py-2 font-semibold text-text-primary" colSpan={2}>{'סה"כ'}</td>
                      <td className="py-2 font-semibold text-text-primary">{syncedMix.reduce((s, u) => s + u.count, 0)}</td>
                      <td />
                      <td className="py-2 font-semibold text-success">{formatCurrency(financials.revenue, { compact: true })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === 'cashflow' && (
            <Card header={<h2 className="font-semibold text-text-primary">תזרים מזומנים שנתי</h2>}>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted text-start border-b border-dark-600">
                      <th className="py-2">שנה</th>
                      <th className="py-2">עלות בנייה</th>
                      <th className="py-2">הכנסות</th>
                      <th className="py-2">מצטבר</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashflowTable.map((row) => (
                      <tr key={row.year} className="border-t border-dark-600">
                        <td className="py-2 text-text-primary">{row.year}</td>
                        <td className="py-2 text-danger">({formatCurrency(row.constructionCost, { compact: true })})</td>
                        <td className="py-2 text-success">{formatCurrency(row.revenue, { compact: true })}</td>
                        <td className={`py-2 font-semibold ${row.cumulative >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatCurrency(row.cumulative, { compact: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={cashflowTable}>
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
                  <Area type="monotone" dataKey="cumulative" stroke="#6366f1" fill="url(#cfGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}

          {tab === 'sensitivity' && (
            <Card header={<h2 className="font-semibold text-text-primary">ניתוח רגישות — ROI% לפי שינוי מחיר מכירה ועלות בנייה</h2>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr>
                      <th className="p-2 text-text-muted" />
                      {[-20, 0, 20].map((d) => (
                        <th key={d} className="p-2 text-text-muted">{d > 0 ? '+' : ''}{d}% עלות בנייה</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivityGrid.map((row, ri) => (
                      <tr key={ri}>
                        <td className="p-2 text-text-muted text-end">{[-20, 0, 20][ri] > 0 ? '+' : ''}{[-20, 0, 20][ri]}% מחיר מכירה</td>
                        {row.map((cell, ci) => {
                          const color = cell.roi >= 25 ? 'bg-success/20 text-success' : cell.roi >= 15 ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'
                          return (
                            <td key={ci} className={`p-3 font-bold rounded-lg ${color}`}>
                              {formatPercent(cell.roi, 1)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === 'scenarios' && (
            <div className="space-y-4">
              {scenarios.length === 0 && (
                <Card>
                  <p className="text-text-muted text-center py-6 text-sm">
                    שמור תרחישים מלוח התוצאות כדי להשוות ביניהם
                  </p>
                </Card>
              )}
              {scenarios.map((sc) => (
                <Card key={sc.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{sc.label}</p>
                      <p className="text-sm text-text-muted">ROI: {formatPercent(sc.roi)}</p>
                    </div>
                    <button onClick={() => removeScenario(sc.id)} className="text-danger hover:bg-danger/10 p-2 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-center">
                    <div className="p-2 rounded-lg bg-dark-700/60">
                      <p className="text-text-muted">הכנסות</p>
                      <p className="text-text-primary font-medium">{formatCurrency(sc.financials.revenue, { compact: true })}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-dark-700/60">
                      <p className="text-text-muted">עלות כוללת</p>
                      <p className="text-text-primary font-medium">{formatCurrency(sc.financials.totalCost, { compact: true })}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-dark-700/60">
                      <p className="text-text-muted">רווח</p>
                      <p className="text-success font-medium">{formatCurrency(sc.financials.profit, { compact: true })}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tab === 'rights' && (
            <Card header={<h2 className="font-semibold text-text-primary">מחשבון זכויות בנייה</h2>}>
              <div className="space-y-4">
                <SliderRow label={'שטח מגרש (מ"ר)'} value={landArea} min={200} max={10000} step={50} onChange={setLandArea} unit={' מ"ר'} />
                <SliderRow label="מקדם בנייה קיים" value={existingRights} min={0.1} max={5} step={0.1} onChange={setExistingRights} />
                <SliderRow label="מקדם בנייה מוצע" value={proposedRights} min={0.1} max={10} step={0.1} onChange={setProposedRights} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="p-4 rounded-xl bg-dark-700/50 text-center">
                  <p className="text-text-muted text-xs mb-1">שטח בנייה קיים</p>
                  <p className="text-xl font-bold text-text-primary">{formatNumber(buildingRights.existingBuiltArea)} מ"ר</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-700/50 text-center">
                  <p className="text-text-muted text-xs mb-1">שטח בנייה מוצע</p>
                  <p className="text-xl font-bold text-brand-primary">{formatNumber(buildingRights.newBuiltArea)} מ"ר</p>
                </div>
                <div className="p-4 rounded-xl bg-success/15 border border-success/30 text-center">
                  <p className="text-text-muted text-xs mb-1">תוספת זכויות</p>
                  <p className="text-xl font-bold text-success">{formatNumber(buildingRights.addedArea)} מ"ר</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card header={<h2 className="font-semibold text-text-primary">תוצאות</h2>}>
              <div className="text-center py-3">
                <p className="text-xs text-text-muted mb-1">תשואה על ההשקעה (ROI)</p>
                <p className={`text-5xl font-extrabold ${roiColor}`}>{formatPercent(financials.roi, 1)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <ResultMetric label="IRR" value={formatPercent(isFinite(irr) ? irr : 0, 1)} />
                <ResultMetric label="NPV" value={formatCurrency(npv, { compact: true })} color={npv >= 0 ? 'text-success' : 'text-danger'} />
                <ResultMetric label="רווח" value={formatCurrency(financials.profit, { compact: true })} color="text-success" />
                <ResultMetric label="תקופת החזר" value={`${payback.toFixed(1)} שנים`} />
                <ResultMetric label="הכנסות" value={formatCurrency(financials.revenue, { compact: true })} />
                <ResultMetric label="עלות כוללת" value={formatCurrency(financials.totalCost, { compact: true })} />
              </div>

              <div className="mt-4">
                <p className="text-xs text-text-muted mb-3">פירוט עלויות</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={costBreakdown} dataKey="value" nameKey="name" innerRadius={35} outerRadius={60}>
                      {costBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <RTooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(v) => formatCurrency(v, { compact: true })}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <Button onClick={handleSaveScenario} variant="secondary" icon={Save} size="sm">
                  שמור תרחיש
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
