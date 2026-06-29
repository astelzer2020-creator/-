import { CITY_PRICES, CITY_NAMES } from './cityPrices'
import { PLAN_TYPES } from '../utils/calculations'

const STATUSES = ['planning', 'approved', 'in_progress', 'completed']

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function generateProjects(count = 24) {
  const rand = seededRandom(42)
  const projects = []
  for (let i = 0; i < count; i++) {
    const city = CITY_NAMES[Math.floor(rand() * CITY_NAMES.length)]
    const prices = CITY_PRICES[city]
    const planType = PLAN_TYPES[Math.floor(rand() * PLAN_TYPES.length)]
    const existingUnits = Math.floor(10 + rand() * 40)
    const addedUnits = Math.floor(10 + rand() * 60)
    const units = existingUnits + addedUnits
    const avgUnitSize = Math.floor(65 + rand() * 50)
    const investment = units * avgUnitSize * prices.build
    const roi = Math.round((8 + rand() * 35) * 10) / 10
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]
    const jitterLat = (rand() - 0.5) * 0.06
    const jitterLng = (rand() - 0.5) * 0.06

    projects.push({
      id: i + 1,
      name: `מתחם ${['הדר', 'הרצל', 'בן גוריון', 'ויצמן', 'סוקולוב', 'רוטשילד', 'ז\'בוטינסקי', 'ביאליק'][i % 8]} ${i + 1}`,
      address: `רחוב ${['הרצל', 'ויצמן', 'ביאליק', 'דיזנגוף'][i % 4]} ${10 + i}`,
      city,
      planType,
      status,
      existingUnits,
      addedUnits,
      units,
      avgUnitSize,
      investment,
      roi,
      lat: prices.lat + jitterLat,
      lng: prices.lng + jitterLng,
      createdAt: new Date(2024, i % 12, ((i * 3) % 27) + 1).toISOString(),
    })
  }
  return projects
}

export const MOCK_PROJECTS = generateProjects()

export const STATUS_LABELS = {
  planning: { he: 'בתכנון', en: 'Planning', variant: 'neutral' },
  approved: { he: 'אושר', en: 'Approved', variant: 'info' },
  in_progress: { he: 'בביצוע', en: 'In Progress', variant: 'warning' },
  completed: { he: 'הושלם', en: 'Completed', variant: 'success' },
}
