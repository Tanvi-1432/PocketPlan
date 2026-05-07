import type { Transaction, Budget, SavingsGoal, Category, TransactionType } from '../types'
import { ALL_CATEGORIES } from '../constants'

// ---- Export ----

function escapeCSV(val: string | number | boolean | undefined): string {
  const s = String(val ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function toCSV(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map((r) => r.map(escapeCSV).join(',')).join('\n')
}

export function exportTransactionsCSV(transactions: Transaction[]): string {
  const headers = ['id', 'date', 'title', 'amount', 'type', 'category', 'source', 'note', 'isRecurring', 'recurringFrequency', 'tags']
  const rows = transactions.map((t) => [
    t.id, t.date, t.title, String(t.amount), t.type, t.category,
    t.source ?? 'manual', t.note ?? '', String(!!t.isRecurring),
    t.recurringFrequency ?? '', (t.tags ?? []).join(';'),
  ])
  return toCSV(headers, rows)
}

export function exportBudgetsCSV(budgets: Budget[]): string {
  const headers = ['id', 'month', 'category', 'limit']
  const rows = budgets.map((b) => [b.id, b.month, b.category, String(b.limit)])
  return toCSV(headers, rows)
}

export function exportGoalsCSV(goals: SavingsGoal[]): string {
  const headers = ['id', 'name', 'targetAmount', 'currentAmount', 'deadline']
  const rows = goals.map((g) => [g.id, g.name, String(g.targetAmount), String(g.currentAmount), g.deadline])
  return toCSV(headers, rows)
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ---- Import ----

export interface ParsedCSVRow {
  date: string
  title: string
  amount: number
  type: TransactionType
  category: Category
  note: string
  valid: boolean
  error?: string
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

export function parseTransactionsCSV(raw: string): ParsedCSVRow[] {
  const lines = raw.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())
  const get = (row: string[], key: string) => row[headers.indexOf(key)] ?? ''

  return lines.slice(1).map((line) => {
    const row = parseCSVLine(line)

    const date  = get(row, 'date').slice(0, 10)
    const title = get(row, 'title') || get(row, 'description') || get(row, 'name')
    const rawAmount = parseFloat(get(row, 'amount').replace(/[$,]/g, ''))
    const amount = Math.abs(isNaN(rawAmount) ? 0 : rawAmount)

    const rawType = get(row, 'type').toLowerCase()
    const type: TransactionType =
      rawType === 'income' ? 'income' :
      rawType === 'expense' ? 'expense' :
      rawAmount < 0 ? 'expense' : 'income'

    const rawCat = get(row, 'category')
    const category: Category = (ALL_CATEGORIES as string[]).includes(rawCat)
      ? rawCat as Category
      : 'Other'

    const note = get(row, 'note') || get(row, 'memo') || ''

    const errors: string[] = []
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('Invalid date')
    if (!title) errors.push('Missing title')
    if (amount <= 0) errors.push('Invalid amount')

    return {
      date, title, amount, type, category, note,
      valid: errors.length === 0,
      error: errors.join('; ') || undefined,
    }
  })
}
