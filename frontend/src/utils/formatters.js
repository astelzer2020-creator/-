import { format } from 'date-fns'

/**
 * Format a number as Israeli Shekel currency.
 * @param {number} n
 * @param {{ compact?: boolean, decimals?: number }} [opts]
 * @returns {string}
 */
export function formatCurrency(n, opts = {}) {
  const { compact = false, decimals = 0 } = opts
  if (n === null || n === undefined || Number.isNaN(n)) return '₪0'
  if (compact) {
    const abs = Math.abs(n)
    if (abs >= 1_000_000_000) return `₪${(n / 1_000_000_000).toFixed(2)}B`
    if (abs >= 1_000_000) return `₪${(n / 1_000_000).toFixed(2)}M`
    if (abs >= 1_000) return `₪${(n / 1_000).toFixed(1)}K`
  }
  return `₪${n.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}`
}

/**
 * Format a number as a percentage string.
 * @param {number} n
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercent(n, decimals = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return '0%'
  return `${n.toFixed(decimals)}%`
}

/**
 * Format a plain number with thousands separators.
 * @param {number} n
 * @param {number} [decimals=0]
 * @returns {string}
 */
export function formatNumber(n, decimals = 0) {
  if (n === null || n === undefined || Number.isNaN(n)) return '0'
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
}

/**
 * Format a date using a friendly pattern.
 * @param {Date|string|number} d
 * @param {string} [pattern='dd/MM/yyyy']
 * @returns {string}
 */
export function formatDate(d, pattern = 'dd/MM/yyyy') {
  if (!d) return ''
  try {
    return format(new Date(d), pattern)
  } catch {
    return ''
  }
}
