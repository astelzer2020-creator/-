const express = require('express')
const multer = require('multer')
const XLSX = require('xlsx')
const router = express.Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })

const FIELD_MAP = {
  'מספר תיק': 'caseNumber', 'כתובת': 'address', 'עיר': 'city',
  'גוש': 'block', 'חלקה': 'parcel', 'סוג בניין': 'buildingType',
  'שנת בנייה': 'buildYear', 'קומות קיים': 'existingFloors',
  'קומות מוצע': 'proposedFloors', 'יח"ד קיים': 'existingUnits',
  'יח"ד מוצע': 'proposedUnits', 'שטח קרקע': 'landArea',
  'שווי קרקע': 'landValue', 'עלות בנייה': 'buildCost',
  'מחיר מכירה': 'salePrice', 'סוג תוכנית': 'planType', 'סטטוס': 'status',
}

function normalizeRow(row) {
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    out[FIELD_MAP[k.trim()] || k] = v
  }
  return out
}

router.post('/excel', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  try {
    const wb = XLSX.read(req.file.buffer, { type: 'buffer', codepage: 1255 })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const raw = XLSX.utils.sheet_to_json(ws, { defval: '' })
    const rows = raw.map(normalizeRow)
    res.json({ rows, count: rows.length, sheets: wb.SheetNames, source: req.file.originalname })
  } catch (err) {
    res.status(422).json({ error: err.message })
  }
})

router.post('/json', (req, res) => {
  try {
    const data = req.body
    const rows = Array.isArray(data) ? data : data.features?.map(f => f.properties) || [data]
    res.json({ rows: rows.map(normalizeRow), count: rows.length })
  } catch (err) {
    res.status(422).json({ error: err.message })
  }
})

router.get('/template', (_, res) => {
  const template = [
    Object.fromEntries(Object.keys(FIELD_MAP).map(k => [k, ''])),
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(template), 'תבנית')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  res.setHeader('Content-Disposition', 'attachment; filename="taba-template.xlsx"')
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.send(buf)
})

module.exports = router
