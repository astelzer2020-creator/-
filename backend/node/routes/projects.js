const express = require('express')
const router = express.Router()

let projects = []
let nextId = 1

router.get('/', (req, res) => {
  const { city, status, type } = req.query
  let data = [...projects]
  if (city) data = data.filter(p => p.city === city)
  if (status) data = data.filter(p => p.status === status)
  if (type) data = data.filter(p => p.type === type)
  res.json({ data, total: data.length })
})

router.get('/:id', (req, res) => {
  const p = projects.find(p => p.id === Number(req.params.id))
  if (!p) return res.status(404).json({ error: 'Project not found' })
  res.json(p)
})

router.post('/', (req, res) => {
  const project = { ...req.body, id: nextId++, createdAt: new Date().toISOString() }
  projects.push(project)
  res.status(201).json(project)
})

router.put('/:id', (req, res) => {
  const idx = projects.findIndex(p => p.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  projects[idx] = { ...projects[idx], ...req.body, updatedAt: new Date().toISOString() }
  res.json(projects[idx])
})

router.delete('/:id', (req, res) => {
  const idx = projects.findIndex(p => p.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  projects.splice(idx, 1)
  res.json({ success: true })
})

router.post('/bulk', (req, res) => {
  const { items } = req.body
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be array' })
  const created = items.map(item => ({ ...item, id: nextId++, createdAt: new Date().toISOString() }))
  projects.push(...created)
  res.status(201).json({ created: created.length, data: created })
})

module.exports = router
