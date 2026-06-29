import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Database } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '../store/projectStore'

const FIELD_MAP = {
  // Hebrew → English field mapping for Taba/PIO exports
  'מספר תיק': 'caseNumber',
  'כתובת': 'address',
  'עיר': 'city',
  'גוש': 'block',
  'חלקה': 'parcel',
  'סוג בניין': 'buildingType',
  'שנת בנייה': 'buildYear',
  'קומות קיים': 'existingFloors',
  'קומות מוצע': 'proposedFloors',
  'יח"ד קיים': 'existingUnits',
  'יח"ד מוצע': 'proposedUnits',
  'שטח קרקע': 'landArea',
  'שווי קרקע': 'landValue',
  'עלות בנייה': 'buildCost',
  'מחיר מכירה': 'salePrice',
  'סוג תוכנית': 'planType',
  'סטטוס': 'status',
}

function normalizeRow(row) {
  const out = {}
  for (const [key, val] of Object.entries(row)) {
    const mapped = FIELD_MAP[key.trim()] || key
    out[mapped] = val
  }
  return out
}

export default function DataImport() {
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)
  const [importing, setImporting] = useState(false)
  const { setImportedData, addProject } = useProjectStore()

  const processFile = useCallback((file) => {
    setError(null)
    const ext = file.name.split('.').pop().toLowerCase()

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: ({ data, errors }) => {
          if (errors.length) return setError(`שגיאת CSV: ${errors[0].message}`)
          setParsed({ rows: data.map(normalizeRow), source: file.name, count: data.length })
        },
      })
    } else if (['xlsx', 'xls'].includes(ext)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array', codepage: 1255 })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
          setParsed({ rows: data.map(normalizeRow), source: file.name, count: data.length, sheets: wb.SheetNames })
        } catch (err) {
          setError(`שגיאת Excel: ${err.message}`)
        }
      }
      reader.readAsArrayBuffer(file)
    } else if (ext === 'json') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          const rows = Array.isArray(data) ? data : data.features?.map(f => f.properties) || [data]
          setParsed({ rows: rows.map(normalizeRow), source: file.name, count: rows.length })
        } catch (err) {
          setError(`שגיאת JSON: ${err.message}`)
        }
      }
      reader.readAsText(file, 'UTF-8')
    } else {
      setError('פורמט לא נתמך. נא להשתמש ב-CSV, Excel או JSON.')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && processFile(files[0]),
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/json': ['.json'] },
    maxFiles: 1,
  })

  const handleImport = () => {
    if (!parsed) return
    setImporting(true)
    setTimeout(() => {
      setImportedData(parsed)
      parsed.rows.forEach((row) => {
        if (row.address || row.caseNumber) {
          addProject({
            name: row.address || `תיק ${row.caseNumber}`,
            city: row.city || 'לא ידוע',
            type: row.planType || row.buildingType || 'תמ"א 38',
            existingUnits: Number(row.existingUnits) || 0,
            proposedUnits: Number(row.proposedUnits) || 0,
            landArea: Number(row.landArea) || 0,
            investment: Number(row.buildCost) || 0,
            roi: row.proposedUnits && row.existingUnits
              ? Math.round(((row.proposedUnits - row.existingUnits) / row.existingUnits) * 100)
              : 0,
            lat: 32.0853 + (Math.random() - 0.5) * 0.5,
            lng: 34.7818 + (Math.random() - 0.5) * 0.5,
            status: row.status || 'בתכנון',
            raw: row,
          })
        }
      })
      setImporting(false)
    }, 800)
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">יבוא נתוני תב"ע / PIO</h1>
        <p className="text-slate-400 mt-1">יבא נתונים ממערכת תב"ע, PIO או קובץ Excel מותאם</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'תב"ע', desc: 'ייצוא ממערכת תב"ע הלאומית' },
          { label: 'PIO', desc: 'מערכת PIO עירונית' },
          { label: 'Excel מותאם', desc: 'תבנית Excel עצמית' },
        ].map(({ label, desc }) => (
          <div key={label} className="glass rounded-xl p-4 text-center">
            <FileSpreadsheet className="mx-auto mb-2 text-blue-400" size={24} />
            <p className="font-semibold text-white text-sm">{label}</p>
            <p className="text-xs text-slate-400 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-blue-500/60 hover:bg-slate-800/30'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={40} className="mx-auto mb-4 text-slate-500" />
        <p className="text-lg font-medium text-slate-300">
          {isDragActive ? 'שחרר כאן...' : 'גרור קובץ לכאן, או לחץ לבחירה'}
        </p>
        <p className="text-sm text-slate-500 mt-2">תומך ב: CSV, Excel (.xlsx), JSON / GeoJSON</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <AlertCircle size={18} />
            <span className="text-sm flex-1">{error}</span>
            <button onClick={() => setError(null)}><X size={16} /></button>
          </motion.div>
        )}

        {parsed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle size={20} className="text-green-400" />
              <h2 className="text-lg font-semibold text-white">קובץ נטען בהצלחה</h2>
              <span className="mr-auto text-xs glass px-3 py-1 rounded-full text-slate-400">{parsed.source}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{parsed.count}</p>
                <p className="text-xs text-slate-400 mt-1">רשומות</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-400">{Object.keys(parsed.rows[0] || {}).length}</p>
                <p className="text-xs text-slate-400 mt-1">עמודות</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{parsed.sheets?.length || 1}</p>
                <p className="text-xs text-slate-400 mt-1">גיליונות</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700/50 mb-4" style={{ maxHeight: 260 }}>
              <table className="w-full text-xs">
                <thead className="bg-slate-800 sticky top-0">
                  <tr>
                    {Object.keys(parsed.rows[0] || {}).slice(0, 8).map((k) => (
                      <th key={k} className="px-3 py-2 text-right text-slate-400 font-medium border-b border-slate-700">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 8).map((row, i) => (
                    <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/40">
                      {Object.values(row).slice(0, 8).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-slate-300 max-w-24 truncate">{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Database size={18} />
              {importing ? 'מייבא...' : `ייבא ${parsed.count} רשומות למערכת`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-3">מיפוי עמודות — תב"ע / PIO</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(FIELD_MAP).map(([heb, eng]) => (
            <div key={eng} className="flex items-center gap-2 text-xs py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 w-28 shrink-0">{heb}</span>
              <span className="text-slate-600">→</span>
              <span className="text-blue-400 font-mono">{eng}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
