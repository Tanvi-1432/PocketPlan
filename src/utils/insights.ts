import type { Transaction, Budget, BudgetProgress } from '../types'
import { filterByMonth, groupByCategory, getTotalIncome, getTotalExpenses, getBalance } from './transactions'
import { getBudgetProgress } from './budgets'
import { formatCurrency } from './currency'

/**
 * Generates short, human-readable insights for the dashboard.
 *
 * The function intentionally limits output to the highest-signal messages so
 * the dashboard feels helpful instead of noisy.
 */
export interface Insight {
  id: string
  text: string
  type: 'positive' | 'warning' | 'neutral' | 'negative'
}

export function generateInsights(
  transactions: Transaction[],
  budgets: Budget[],
  monthKey: string
): Insight[] {
  const monthly = filterByMonth(transactions, monthKey)
  const expenses = monthly.filter((t) => t.type === 'expense')
  const income = getTotalIncome(monthly)
  const totalExpenses = getTotalExpenses(monthly)
  const balance = getBalance(monthly)

  const insights: Insight[] = []

  if (monthly.length === 0) return insights

  // Highest spending category: quick answer to "where did my money go?"
  const categoryTotals = groupByCategory(expenses)
  if (categoryTotals.length > 0) {
    const top = categoryTotals[0]
    insights.push({
      id: 'top-category',
      text: `Your highest spending category is ${top.category} at ${formatCurrency(top.total)}.`,
      type: 'neutral',
    })
  }

  // Savings / balance insight compares net cash flow against income.
  if (income > 0) {
    if (balance > 0) {
      const savingsRate = Math.round((balance / income) * 100)
      insights.push({
        id: 'savings',
        text: `You saved ${formatCurrency(balance)} this month — ${savingsRate}% of your income.`,
        type: 'positive',
      })
    } else if (balance < 0) {
      insights.push({
        id: 'overspend',
        text: `You've spent ${formatCurrency(Math.abs(balance))} more than you earned this month.`,
        type: 'negative',
      })
    }
  }

  // Budget insights reuse the same progress calculation as budget cards, so
  // dashboard warnings stay consistent with the Budgets page.
  const progress: BudgetProgress[] = getBudgetProgress(budgets, transactions, monthKey)

  const overBudget = progress.filter((p) => p.isOverBudget)
  if (overBudget.length > 0) {
    const names = overBudget.map((p) => p.budget.category).join(', ')
    insights.push({
      id: 'over-budget',
      text: `${overBudget.length === 1 ? overBudget[0].budget.category + ' is' : names + ' are'} over budget this month.`,
      type: 'negative',
    })
  }

  const nearLimit = progress.filter((p) => !p.isOverBudget && p.percentUsed >= 80)
  if (nearLimit.length > 0 && nearLimit.length !== overBudget.length) {
    const p = nearLimit[0]
    insights.push({
      id: 'near-limit',
      text: `${p.budget.category} is at ${Math.round(p.percentUsed)}% of its monthly limit (${formatCurrency(p.spent)} of ${formatCurrency(p.budget.limit)}).`,
      type: 'warning',
    })
  }

  // Expense vs income ratio rewards low spend months when income exists.
  if (income > 0 && totalExpenses > 0) {
    const ratio = Math.round((totalExpenses / income) * 100)
    if (ratio < 70) {
      insights.push({
        id: 'low-spend-ratio',
        text: `Great discipline — you've spent only ${ratio}% of your income this month.`,
        type: 'positive',
      })
    }
  }

  return insights.slice(0, 5)
}
