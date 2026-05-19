import type { Budget, Transaction, BudgetProgress } from '../types'
import { filterByMonth, groupByCategory } from './transactions'

/**
 * Calculates budget usage for one month.
 *
 * Flow:
 * 1. Filter transactions to the selected month and expenses only.
 * 2. Group spending by category.
 * 3. Match each budget to its category total.
 */
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

      // Remaining is clamped at zero for display. `isOverBudget` separately
      // preserves whether the user exceeded the limit.
      const remaining = Math.max(budget.limit - spent, 0)

      // Progress bars cap at 100% so over-budget cards do not overflow their UI.
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
