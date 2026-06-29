/**
 * Pure financial calculation functions for the urban renewal ROI engine.
 * All monetary values are in Israeli Shekels (₪) unless noted otherwise.
 */

export const UNIT_TYPES = [
  { key: 'studio', label: 'סטודיו', size: 35 },
  { key: 'room2', label: '2 חדרים', size: 50 },
  { key: 'room3', label: '3 חדרים', size: 70 },
  { key: 'room4', label: '4 חדרים', size: 90 },
  { key: 'room5', label: '5 חדרים', size: 120 },
  { key: 'penthouse', label: 'פנטהאוז', size: 160 },
]

export const PLAN_TYPES = ['תמ"א 38/1', 'תמ"א 38/2', 'פינוי-בינוי', 'עיבוי-בינוי']

const CAP_RATE_MONTHS = 12
const CAP_RATE_YEARS_MULTIPLIER = 8

/**
 * Sum revenue contributed by the residential apartment mix.
 * @param {{count:number,size:number,pricePerSqm:number}[]} unitMix
 * @returns {number}
 */
export function calcResidentialRevenue(unitMix) {
  return unitMix.reduce((sum, u) => sum + u.count * u.size * u.pricePerSqm, 0)
}

/**
 * Calculate total project revenue: residential sales + capitalized commercial rent.
 * @param {object} params
 * @param {{count:number,size:number,pricePerSqm:number}[]} params.unitMix
 * @param {number} params.commercialArea
 * @param {number} params.commercialRentPerSqm
 * @param {number} params.projectYears
 * @returns {number}
 */
export function calcRevenue({ unitMix, commercialArea, commercialRentPerSqm, projectYears }) {
  const residential = calcResidentialRevenue(unitMix)
  const commercial =
    commercialArea * commercialRentPerSqm * CAP_RATE_MONTHS * projectYears * CAP_RATE_YEARS_MULTIPLIER
  return residential + commercial
}

/**
 * Calculate construction cost including parking.
 * @param {object} params
 * @param {number} params.totalNewUnits
 * @param {number} params.avgUnitSize
 * @param {number} params.buildCost - cost per sqm
 * @param {number} params.parkingUnderground - count
 * @param {number} params.parkingAbove - count
 * @returns {number}
 */
export function calcConstructionCost({ totalNewUnits, avgUnitSize, buildCost, parkingUnderground, parkingAbove }) {
  return totalNewUnits * avgUnitSize * buildCost + parkingUnderground * 80000 + parkingAbove * 15000
}

/**
 * Calculate total tenant relocation compensation cost.
 * @param {number} existingUnits
 * @param {number} tenantCompensation - monthly amount per unit
 * @param {number} projectYears
 * @returns {number}
 */
export function calcTenantCost(existingUnits, tenantCompensation, projectYears) {
  return existingUnits * tenantCompensation * 12 * projectYears
}

/**
 * Calculate demolition cost (applies to הריסה / פינוי-בינוי plans).
 * @param {string} planType
 * @param {number} landArea
 * @returns {number}
 */
export function calcDemolitionCost(planType, landArea) {
  return planType.includes('הריסה') || planType.includes('פינוי') ? landArea * 250 : 0
}

/**
 * Calculate betterment levy (היטל השבחה) — waived for פינוי-בינוי.
 * @param {string} planType
 * @param {number} revenue
 * @returns {number}
 */
export function calcBettermentLevy(planType, revenue) {
  return planType === 'פינוי-בינוי' ? 0 : revenue * 0.025
}

/**
 * Run the full project financial model.
 * @param {object} inputs
 * @returns {object} breakdown of revenue, costs, profit and ROI
 */
export function calcProjectFinancials(inputs) {
  const {
    planType,
    unitMix,
    commercialArea = 0,
    commercialRentPerSqm = 0,
    totalNewUnits,
    avgUnitSize,
    buildCost,
    parkingUnderground = 0,
    parkingAbove = 0,
    existingUnits,
    tenantCompensation,
    projectYears,
    landArea,
    financeRate,
  } = inputs

  const revenue = calcRevenue({ unitMix, commercialArea, commercialRentPerSqm, projectYears })
  const constructionCost = calcConstructionCost({ totalNewUnits, avgUnitSize, buildCost, parkingUnderground, parkingAbove })
  const tenantCost = calcTenantCost(existingUnits, tenantCompensation, projectYears)
  const demolitionCost = calcDemolitionCost(planType, landArea)
  const permits = revenue * 0.035
  const bettermentLevy = calcBettermentLevy(planType, revenue)
  const marketing = revenue * 0.02
  const finance = constructionCost * (financeRate / 100) * projectYears
  const overhead = constructionCost * 0.08

  const totalCost = constructionCost + tenantCost + demolitionCost + permits + bettermentLevy + marketing + finance + overhead
  const profit = revenue - totalCost
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0

  return {
    revenue,
    constructionCost,
    tenantCost,
    demolitionCost,
    permits,
    bettermentLevy,
    marketing,
    finance,
    overhead,
    totalCost,
    profit,
    roi,
  }
}

/**
 * Build a yearly cashflow array suitable for IRR/NPV: [-totalCost, 0, ..., revenue].
 * @param {number} totalCost
 * @param {number} revenue
 * @param {number} projectYears
 * @returns {number[]}
 */
export function buildCashflows(totalCost, revenue, projectYears) {
  const flows = new Array(projectYears + 1).fill(0)
  flows[0] = -totalCost
  flows[projectYears] = revenue
  return flows
}

/**
 * Calculate Internal Rate of Return using Newton-Raphson iteration.
 * @param {number[]} cashflows
 * @returns {number} IRR as a percentage
 */
export function calcIRR(cashflows) {
  let rate = 0.1
  for (let i = 0; i < 100; i++) {
    const npv = cashflows.reduce((s, cf, t) => s + cf / Math.pow(1 + rate, t), 0)
    const dnpv = cashflows.reduce((s, cf, t) => s - (t * cf) / Math.pow(1 + rate, t + 1), 0)
    if (dnpv === 0) break
    const newRate = rate - npv / dnpv
    if (Math.abs(newRate - rate) < 1e-7) {
      rate = newRate
      break
    }
    rate = newRate
  }
  if (!Number.isFinite(rate)) return 0
  return rate * 100
}

/**
 * Calculate Net Present Value of a cashflow series at a given discount rate.
 * @param {number[]} cashflows
 * @param {number} discountRatePercent
 * @returns {number}
 */
export function calcNPV(cashflows, discountRatePercent) {
  const r = discountRatePercent / 100
  return cashflows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0)
}

/**
 * Estimate payback period in years (simple, linear interpolation within the final flow year).
 * @param {number[]} cashflows
 * @returns {number}
 */
export function calcPaybackPeriod(cashflows) {
  let cumulative = 0
  for (let t = 0; t < cashflows.length; t++) {
    const prev = cumulative
    cumulative += cashflows[t]
    if (cumulative >= 0 && t > 0) {
      const frac = prev < 0 ? -prev / cashflows[t] : 0
      return t - 1 + frac
    }
  }
  return cashflows.length
}

/**
 * Build a year-by-year cost/revenue/cumulative table for display.
 * Construction cost is spread evenly across the years; revenue lands in the final year.
 * @param {object} financials
 * @param {number} projectYears
 * @returns {{year:number, constructionCost:number, revenue:number, cumulative:number}[]}
 */
export function buildYearlyCashflowTable(financials, projectYears) {
  const annualCost = financials.totalCost / projectYears
  let cumulative = 0
  const rows = []
  for (let y = 1; y <= projectYears; y++) {
    const revenue = y === projectYears ? financials.revenue : 0
    cumulative += revenue - annualCost
    rows.push({ year: y, constructionCost: annualCost, revenue, cumulative })
  }
  return rows
}

/**
 * Run a 3x3 sensitivity grid varying sale price and build cost by the given percentage steps.
 * @param {object} inputs - same shape as calcProjectFinancials
 * @param {number[]} [steps] - percentage deltas, e.g. [-20,0,20]
 * @returns {{salePriceDelta:number, buildCostDelta:number, roi:number}[][]}
 */
export function calcSensitivityGrid(inputs, steps = [-20, 0, 20]) {
  return steps.map((salePriceDelta) =>
    steps.map((buildCostDelta) => {
      const adjustedUnitMix = inputs.unitMix.map((u) => ({
        ...u,
        pricePerSqm: u.pricePerSqm * (1 + salePriceDelta / 100),
      }))
      const adjustedBuildCost = inputs.buildCost * (1 + buildCostDelta / 100)
      const result = calcProjectFinancials({ ...inputs, unitMix: adjustedUnitMix, buildCost: adjustedBuildCost })
      return { salePriceDelta, buildCostDelta, roi: result.roi }
    })
  )
}

/**
 * Calculate building rights areas for a lot.
 * @param {number} lotArea - מ"ר
 * @param {number} existingCoefficient - e.g. 0.4 = 40%
 * @param {number} proposedCoefficient
 * @returns {{existingBuiltArea:number, newBuiltArea:number, addedArea:number}}
 */
export function calcBuildingRights(lotArea, existingCoefficient, proposedCoefficient) {
  const existingBuiltArea = lotArea * existingCoefficient
  const newBuiltArea = lotArea * proposedCoefficient
  const addedArea = newBuiltArea - existingBuiltArea
  return { existingBuiltArea, newBuiltArea, addedArea }
}
