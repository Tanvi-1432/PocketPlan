import { useSettingsStore } from '../store/settings'
import type { DateFormatPreference } from '../types'

function getSettings() {
  return useSettingsStore.getState().settings
}

function applyDateFormat(d: Date, fmt: DateFormatPreference): string {
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')

  switch (fmt) {
    case 'MM/DD/YYYY':  return `${mm}/${dd}/${yyyy}`
    case 'DD/MM/YYYY':  return `${dd}/${mm}/${yyyy}`
    case 'YYYY-MM-DD':  return `${yyyy}-${mm}-${dd}`
    case 'MMM D, YYYY':
    default:
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

// "2024-03-15" → formatted date per user preference
export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return applyDateFormat(d, getSettings().dateFormat)
}

// "2024-03-15" → "2024-03"
export function toMonthKey(isoDate: string): string {
  return isoDate.slice(0, 7)
}

// "2024-03" → "Mar 2024"
export function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

// Returns current month key: "2024-03"
export function currentMonthKey(): string {
  return toMonthKey(new Date().toISOString())
}

// Today's ISO date string: "2024-03-15"
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
