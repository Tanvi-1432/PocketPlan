import type { Transaction, CategorySummary, MonthlySummary, MonthlyChartPoint } from '../types'
import { toMonthKey } from './date'

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpenses(transactions)
}

export function filterByMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter((t) => toMonthKey(t.date) === monthKey)
}

export function groupByCategory(transactions: Transaction[]): CategorySummary[] {
  const map = new Map<string, number>()

  for (const t of transactions) {
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
  }

  return Array.from(map.entries())
    .map(([category, total]) => ({ category: category as CategorySummary['category'], total }))
    .sort((a, b) => b.total - a.total)
}

export function getMonthlySummaries(transactions: Transaction[]): MonthlySummary[] {
  const map = new Map<string, { income: number; expenses: number }>()

  for (const t of transactions) {
    const key = toMonthKey(t.date)
    const entry = map.get(key) ?? { income: 0, expenses: 0 }
    if (t.type === 'income') entry.income += t.amount
    else entry.expenses += t.amount
    map.set(key, entry)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { income, expenses }]) => ({
      month,
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    }))
}

export function getMonthlyChartData(transactions: Transaction[]): MonthlyChartPoint[] {
  return getMonthlySummaries(transactions).map(({ month, totalIncome, totalExpenses }) => ({
    month,
    income: totalIncome,
    expenses: totalExpenses,
  }))
}

export function getRecentTransactions(transactions: Transaction[], limit = 5): Transaction[] {
  return [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
}
