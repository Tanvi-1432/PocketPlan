// "2024-03-15" → "Mar 15, 2024"
export function formatDate(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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

// "2024-03-15" → today's ISO date string
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
