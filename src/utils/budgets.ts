import type { Budget, Transaction, BudgetProgress } from '../types'
import { filterByMonth, groupByCategory } from './transactions'

export function getBudgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  monthKey: string
): BudgetProgress[] {
  const monthlyExpenses = filterByMonth(transactions, monthKey).filter(
    (t) => t.type === 'expense'
  )
  const categoryTotals = groupByCategory(monthlyExpenses)
  const spentMap = new Map(categoryTotals.map((c) => [c.category, c.total]))

  return budgets
    .filter((b) => b.month === monthKey)
    .map((budget) => {
      const spent = spentMap.get(budget.category) ?? 0
      const remaining = Math.max(budget.limit - spent, 0)
      const percentUsed = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0

      return {
        budget,
        spent,
        remaining,
        isOverBudget: spent > budget.limit,
        percentUsed,
      }
    })
    .sort((a, b) => b.percentUsed - a.percentUsed)
}
