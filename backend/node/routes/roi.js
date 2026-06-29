const express = require('express')
const axios = require('axios')
const router = express.Router()

const PYTHON_URL = process.env.PYTHON_URL || 'http://localhost:8001'

router.post('/calculate', async (req, res) => {
  try {
    const { data } = await axios.post(`${PYTHON_URL}/roi/calculate`, req.body, { timeout: 10000 })
    res.json(data)
  } catch (err) {
    // Fallback: basic JS calculation if Python is unavailable
    const { existingUnits, addedUnits, avgUnitSize, buildCost, salePrice,
            tenantCompensation, financeRate, projectYears, landArea, planType } = req.body
    const total = (existingUnits || 0) + (addedUnits || 0)
    const revenue = (addedUnits || 0) * (avgUnitSize || 85) * (salePrice || 25000)
    const construction = total * (avgUnitSize || 85) * (buildCost || 11000)
    const tenant = (existingUnits || 0) * (tenantCompensation || 2500) * 12 * (projectYears || 4)
    const demolition = (planType || '').includes('פינוי') ? (landArea || 0) * 200 : 0
    const permits = revenue * 0.035
    const finance = construction * ((financeRate || 5) / 100) * (projectYears || 4)
    const totalCost = construction + tenant + demolition + permits + finance
    const profit = revenue - totalCost
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0
    res.json({ revenue, construction, tenant, demolition, permits, finance, totalCost, profit, roi })
  }
})

router.post('/batch', async (req, res) => {
  const { projects } = req.body
  if (!Array.isArray(projects)) return res.status(400).json({ error: 'projects must be array' })
  try {
    const { data } = await axios.post(`${PYTHON_URL}/roi/batch`, { projects }, { timeout: 30000 })
    res.json(data)
  } catch {
    res.status(503).json({ error: 'Python service unavailable' })
  }
})

module.exports = router
