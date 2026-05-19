import type { Transaction, Category, SpendingComparison, CategoryTrend, MonthlySummary } from '../types'
import { filterByMonth, getTotalIncome, getTotalExpenses, getMonthlySummaries } from './transactions'

/**
 * Multi-month analytics helpers.
 *
 * These functions convert transaction history into comparison and chart shapes
 * for the Analytics page. They stay pure so memoized React components can
 * recompute only when the source arrays change.
 */

function prevMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  const d = new Date(year, month - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function getSpendingComparisons(
  transactions: Transaction[],
  monthKey: string,
): SpendingComparison[] {
  const prev = prevMonthKey(monthKey)
  const thisTxs = filterByMonth(transactions, monthKey).filter((t) => t.type === 'expense')
  const prevTxs = filterByMonth(transactions, prev).filter((t) => t.type === 'expense')

  const categories = [...new Set([...thisTxs, ...prevTxs].map((t) => t.category))] as Category[]

  return categories
    .map((cat) => {
      const thisMonth = thisTxs.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0)
      const lastMonth = prevTxs.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0)
      const deltaAmount = thisMonth - lastMonth
      // When last month was zero, any current spending is treated as a 100%
      // increase instead of dividing by zero.
      const delta = lastMonth > 0 ? (deltaAmount / lastMonth) * 100 : (thisMonth > 0 ? 100 : 0)
      return { category: cat, thisMonth, lastMonth, delta, deltaAmount }
    })
    .filter((c) => c.thisMonth > 0 || c.lastMonth > 0)
    .sort((a, b) => Math.abs(b.deltaAmount) - Math.abs(a.deltaAmount))
}

export function getCategoryTrends(
  transactions: Transaction[],
  months: number = 6,
): CategoryTrend[] {
  // Get last N month keys in chronological order for stable chart axes.
  const now = new Date()
  const monthKeys: string[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const expenses = transactions.filter((t) => t.type === 'expense')
  const categories = [...new Set(expenses.map((t) => t.category))] as Category[]

  return categories.map((cat) => {
    const catTxs = expenses.filter((t) => t.category === cat)
    const monthData = monthKeys.map((month) => ({
      month,
      total: filterByMonth(catTxs, month).reduce((s, t) => s + t.amount, 0),
    }))

    const last  = monthData[monthData.length - 1]?.total ?? 0
    const prev  = monthData[monthData.length - 2]?.total ?? 0
    // Trend delta compares the newest two months for quick direction labels.
    const delta = prev > 0 ? ((last - prev) / prev) * 100 : 0

    return { category: cat, months: monthData, delta }
  }).filter((ct) => ct.months.some((m) => m.total > 0))
}

export function getSavingsRateTrend(transactions: Transaction[], months = 6): MonthlySummary[] {
  return getMonthlySummaries(transactions).slice(-months)
}

export function getIncomeExpenseGrowth(transactions: Transaction[], monthKey: string): {
  incomeGrowth: number
  expenseGrowth: number
  savingsGrowth: number
} {
  const prev = prevMonthKey(monthKey)
  const thisTxs = filterByMonth(transactions, monthKey)
  const prevTxs = filterByMonth(transactions, prev)

  const thisIncome  = getTotalIncome(thisTxs)
  const prevIncome  = getTotalIncome(prevTxs)
  const thisExpense = getTotalExpenses(thisTxs)
  const prevExpense = getTotalExpenses(prevTxs)

  return {
    incomeGrowth:  prevIncome  > 0 ? ((thisIncome  - prevIncome)  / prevIncome)  * 100 : 0,
    expenseGrowth: prevExpense > 0 ? ((thisExpense - prevExpense) / prevExpense) * 100 : 0,
    savingsGrowth: prevIncome  > 0
      ? (((thisIncome - thisExpense) - (prevIncome - prevExpense)) / prevIncome) * 100
      : 0,
  }
}

// Get last N monthly keys for charts
export function getLastNMonthKeys(n: number): string[] {
  const keys: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

// Derive month label from YYYY-MM key
export function shortMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' })
}
