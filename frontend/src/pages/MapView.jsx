import { useEffect, useRef, useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import { MapPin, Filter, Layers } from 'lucide-react'

const STATUS_COLOR = {
  'בתכנון': '#f59e0b',
  'אושר': '#10b981',
  'בביצוע': '#3b82f6',
  'הושלם': '#8b5cf6',
}

const DEMO_PROJECTS = [
  { id: 1, name: 'פרויקט רוטשילד', city: 'תל אביב', lat: 32.0643, lng: 34.7726, status: 'בביצוע', roi: 42, type: 'פינוי-בינוי', units: 180 },
  { id: 2, name: 'שדרות ויצמן', city: 'רחובות', lat: 31.8928, lng: 34.8113, status: 'אושר', roi: 31, type: 'תמ"א 38/2', units: 80 },
  { id: 3, name: 'שכונת נורדאו', city: 'חיפה', lat: 32.8191, lng: 34.9976, status: 'בתכנון', roi: 28, type: 'עיבוי-בינוי', units: 120 },
  { id: 4, name: 'רח\' הרצל', city: 'ראשון לציון', lat: 31.9641, lng: 34.8001, status: 'הושלם', roi: 38, type: 'תמ"א 38/1', units: 60 },
  { id: 5, name: 'שכונת הדר', city: 'חיפה', lat: 32.8208, lng: 35.0067, status: 'בתכנון', roi: 24, type: 'פינוי-בינוי', units: 200 },
  { id: 6, name: 'גבעת שמואל מרכז', city: 'גבעת שמואל', lat: 32.0728, lng: 34.8479, status: 'אושר', roi: 35, type: 'תמ"א 38/2', units: 90 },
  { id: 7, name: 'שכונת פלורנטין', city: 'תל אביב', lat: 32.0523, lng: 34.7707, status: 'בביצוע', roi: 55, type: 'פינוי-בינוי', units: 320 },
  { id: 8, name: 'רמת אביב', city: 'תל אביב', lat: 32.1097, lng: 34.7976, status: 'הושלם', roi: 48, type: 'עיבוי-בינוי', units: 140 },
]

export default function MapView() {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const storeProjects = useProjectStore((s) => s.projects)
  const [statusFilter, setStatusFilter] = useState('הכל')
  const [selected, setSelected] = useState(null)

  const allProjects = [...DEMO_PROJECTS, ...storeProjects.filter(p => p.lat && p.lng)]
  const filtered = statusFilter === 'הכל' ? allProjects : allProjects.filter(p => p.status === statusFilter)

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return
    import('leaflet').then((L) => {
      const map = L.map(mapRef.current, { center: [31.9, 34.85], zoom: 9, zoomControl: false })
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB',
        subdomains: 'abcd',
      }).addTo(map)
      L.control.zoom({ position: 'bottomleft' }).addTo(map)
      mapInstance.current = map
    })
    return () => { mapInstance.current?.remove(); mapInstance.current = null }
  }, [])

  useEffect(() => {
    if (!mapInstance.current) return
    import('leaflet').then((L) => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      filtered.forEach((p) => {
        const color = STATUS_COLOR[p.status] || '#94a3b8'
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:white;box-shadow:0 2px 8px rgba(0,0,0,0.5)">${p.roi || '?'}%</div>`,
          iconSize: [28, 28], iconAnchor: [14, 14],
        })
        const marker = L.marker([p.lat, p.lng], { icon }).addTo(mapInstance.current)
        marker.on('click', () => setSelected(p))
        markersRef.current.push(marker)
      })
    })
  }, [filtered])

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 pb-3">
        <h1 className="text-3xl font-bold gradient-text">מפת פרויקטים</h1>
        <p className="text-slate-400 mt-1">פרויקטי התחדשות עירונית ברחבי ישראל</p>
      </div>

      <div className="flex items-center gap-3 px-6 pb-3">
        {['הכל', ...Object.keys(STATUS_COLOR)].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
              statusFilter === s ? 'bg-blue-600 border-blue-600 text-white' : 'glass border-slate-700 text-slate-400 hover:text-white'
            }`}>
            {s}
            {s !== 'הכל' && (
              <span className="mr-2 opacity-60">
                ({allProjects.filter(p => p.status === s).length})
              </span>
            )}
          </button>
        ))}
        <span className="mr-auto text-xs text-slate-500">{filtered.length} פרויקטים מוצגים</span>
      </div>

      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        <div className="absolute top-4 right-4 space-y-2 z-[1000]">
          {Object.entries(STATUS_COLOR).map(([status, color]) => (
            <div key={status} className="glass flex items-center gap-2 px-3 py-1.5 rounded-full text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-slate-300">{status}</span>
            </div>
          ))}
        </div>

        {selected && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] glass rounded-2xl p-5 min-w-72 shadow-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-white">{selected.name}</h3>
                <p className="text-sm text-slate-400">{selected.city}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-800/60 rounded-xl p-2">
                <p className="text-lg font-bold text-green-400">{selected.roi}%</p>
                <p className="text-xs text-slate-400">ROI</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2">
                <p className="text-lg font-bold text-blue-400">{selected.units}</p>
                <p className="text-xs text-slate-400">יח"ד</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2">
                <p className="text-xs font-bold mt-1" style={{ color: STATUS_COLOR[selected.status] }}>{selected.status}</p>
                <p className="text-xs text-slate-400">סטטוס</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">{selected.type}</p>
          </div>
        )}
      </div>
    </div>
  )
}
