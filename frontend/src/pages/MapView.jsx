import { useEffect, useRef, useState, useMemo } from 'react'
import { MapPin, Filter } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import { useTranslation } from '../i18n/useTranslation'
import { formatCurrency, formatPercent } from '../utils/formatters'
import { CITY_NAMES } from '../data/cityPrices'
import { STATUS_LABELS } from '../data/mockProjects'
import { Card, Select, Badge } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'
import 'leaflet/dist/leaflet.css'

const STATUS_COLORS = {
  planning: '#64748b',
  approved: '#06b6d4',
  in_progress: '#f59e0b',
  completed: '#10b981',
}

export default function MapView() {
  const projects = useProjectStore((s) => s.projects)
  const { t, lang } = useTranslation()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  const [cityFilter, setCityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(
    () => projects.filter((p) => (!cityFilter || p.city === cityFilter) && (!statusFilter || p.status === statusFilter)),
    [projects, cityFilter, statusFilter]
  )

  useEffect(() => {
    let map
    const init = async () => {
      const L = await import('leaflet')

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
      map = L.default.map(mapRef.current, { center: [32.07, 34.78], zoom: 9, zoomControl: true })
      mapInstanceRef.current = map

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      filtered.forEach((project) => {
        if (!project.lat || !project.lng) return

        const color = STATUS_COLORS[project.status] || '#6366f1'
        const circle = L.default.circleMarker([project.lat, project.lng], {
          radius: 10,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })

        circle.bindPopup(`
          <div style="min-width:180px;background:#0d1526;color:#f1f5f9;border-radius:10px;padding:12px;font-family:sans-serif">
            <strong style="font-size:13px">${project.name}</strong><br>
            <span style="font-size:11px;color:#64748b">${project.city} · ${project.planType}</span><br>
            <div style="margin-top:8px;display:flex;justify-content:space-between;">
              <span style="font-size:12px;color:#10b981;font-weight:600">${project.roi}% ROI</span>
              <span style="font-size:12px;color:#94a3b8">${project.units} units</span>
            </div>
          </div>
        `, {
          className: 'dark-popup',
        })

        circle.on('click', () => setSelected(project))
        circle.addTo(map)
        markersRef.current.push(circle)
      })
    }

    if (mapRef.current) init()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [filtered])

  return (
    <div className="space-y-4 h-full flex flex-col">
      <PageHeader title={t('nav.map')} breadcrumb={[{ label: t('nav.dashboard'), to: '/dashboard' }, { label: t('nav.map') }]} />

      <div className="flex flex-wrap gap-3">
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
        <span className="text-xs text-text-muted self-center">{filtered.length} {lang === 'he' ? 'פרויקטים' : 'projects'}</span>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 rounded-2xl overflow-hidden border border-dark-600 min-h-[500px]">
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: 500 }} />
        </div>

        {selected && (
          <div className="w-72 shrink-0">
            <Card>
              <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary text-xs mb-3">✕ Close</button>
              <h3 className="font-semibold text-text-primary mb-1">{selected.name}</h3>
              <p className="text-xs text-text-muted mb-3">{selected.address}, {selected.city}</p>
              <Badge variant={STATUS_LABELS[selected.status]?.variant}>{STATUS_LABELS[selected.status]?.[lang === 'he' ? 'he' : 'en']}</Badge>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="p-2 rounded-lg bg-dark-700/60">
                  <p className="text-text-muted">ROI</p>
                  <p className="text-success font-bold">{formatPercent(selected.roi)}</p>
                </div>
                <div className="p-2 rounded-lg bg-dark-700/60">
                  <p className="text-text-muted">Units</p>
                  <p className="text-text-primary font-bold">{selected.units}</p>
                </div>
                <div className="p-2 rounded-lg bg-dark-700/60">
                  <p className="text-text-muted">Investment</p>
                  <p className="text-text-primary font-bold">{formatCurrency(selected.investment, { compact: true })}</p>
                </div>
                <div className="p-2 rounded-lg bg-dark-700/60">
                  <p className="text-text-muted">Plan</p>
                  <p className="text-text-primary font-bold text-[10px]">{selected.planType}</p>
                </div>
              </div>
            </Card>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`w-full text-start p-3 rounded-xl border transition-all ${selected?.id === p.id ? 'border-brand-primary bg-brand-primary/10' : 'border-dark-600 bg-dark-800/60 hover:border-dark-500'}`}
                >
                  <p className="text-xs font-medium text-text-primary truncate">{p.name}</p>
                  <p className="text-[10px] text-text-muted">{p.city} · {formatPercent(p.roi)}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

