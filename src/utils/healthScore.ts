import type { Transaction, Budget, SavingsGoal, FinancialHealthScore } from '../types'
import { filterByMonth, getTotalIncome, getTotalExpenses } from './transactions'
import { currentMonthKey } from './date'

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v))
}

function prevMonthKey(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function computeHealthScore(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[],
): FinancialHealthScore {
  const monthKey = currentMonthKey()
  const prevKey  = prevMonthKey()

  const thisMonthTxs = filterByMonth(transactions, monthKey)
  const prevMonthTxs = filterByMonth(transactions, prevKey)

  const income   = getTotalIncome(thisMonthTxs)
  const expenses = getTotalExpenses(thisMonthTxs)

  // --- Factor 1: Savings rate (30 pts weight) ---
  const savingsRate = income > 0 ? (income - expenses) / income : 0
  const savingsScore = clamp(savingsRate * 200) // 50% rate = 100 pts
  const savingsSuggestion = savingsRate < 0.1
    ? 'Try to save at least 10-20% of your income each month.'
    : savingsRate < 0.2
    ? 'Good start! Aim for 20%+ savings rate for financial security.'
    : undefined

  // --- Factor 2: Budget adherence (25 pts weight) ---
  const monthBudgets = budgets.filter((b) => b.month === monthKey)
  let adherenceScore = 100
  if (monthBudgets.length > 0) {
    const overBudget = monthBudgets.filter((b) => {
      const spent = thisMonthTxs
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((s, t) => s + t.amount, 0)
      return spent > b.limit
    })
    adherenceScore = clamp(100 - (overBudget.length / monthBudgets.length) * 100)
  }
  const adherenceSuggestion = adherenceScore < 60
    ? 'Several budget categories are over limit. Review your top spending areas.'
    : adherenceScore < 80
    ? 'A few categories are over budget. Consider adjusting your limits or spending.'
    : undefined

  // --- Factor 3: Emergency fund progress (20 pts weight) ---
  const emergencyGoal = goals.find((g) =>
    g.name.toLowerCase().includes('emergency') || g.name.toLowerCase().includes('fund')
  )
  const emergencyScore = emergencyGoal
    ? clamp((emergencyGoal.currentAmount / emergencyGoal.targetAmount) * 100)
    : 20 // neutral if no emergency goal set
  const emergencySuggestion = !emergencyGoal
    ? 'Set up an emergency fund goal. Aim for 3-6 months of expenses.'
    : emergencyScore < 50
    ? 'Build your emergency fund to cover 3-6 months of expenses.'
    : undefined

  // --- Factor 4: Spending consistency (15 pts weight) ---
  const prevExpenses = getTotalExpenses(prevMonthTxs)
  let consistencyScore = 80
  if (prevExpenses > 0 && expenses > 0) {
    const delta = Math.abs(expenses - prevExpenses) / prevExpenses
    consistencyScore = clamp(100 - delta * 100)
  }
  const consistencySuggestion = consistencyScore < 50
    ? 'Large spending swings month-to-month make budgeting harder. Try to smooth out irregular expenses.'
    : undefined

  // --- Factor 5: Debt ratio (10 pts weight) ---
  // Simplified: if expenses > income, debt score is low
  const debtScore = income > 0 ? clamp((1 - Math.max(0, expenses - income) / Math.max(income, 1)) * 100) : 50
  const debtSuggestion = expenses > income
    ? 'You\'re spending more than you earn this month. Reduce expenses or increase income.'
    : undefined

  const factors = [
    { label: 'Savings Rate',        score: savingsScore,    weight: 30, description: `${Math.round(savingsRate * 100)}% of income saved this month`, suggestion: savingsSuggestion },
    { label: 'Budget Adherence',    score: adherenceScore,  weight: 25, description: monthBudgets.length > 0 ? `${monthBudgets.length - Math.round((100 - adherenceScore) / 100 * monthBudgets.length)} of ${monthBudgets.length} budgets on track` : 'No budgets set', suggestion: adherenceSuggestion },
    { label: 'Emergency Fund',      score: emergencyScore,  weight: 20, description: emergencyGoal ? `${Math.round(emergencyScore)}% of goal reached` : 'No emergency goal', suggestion: emergencySuggestion },
    { label: 'Spending Consistency',score: consistencyScore,weight: 15, description: prevExpenses > 0 ? `Month-over-month variance: ${Math.round(Math.abs(expenses - prevExpenses) / Math.max(prevExpenses, 1) * 100)}%` : 'Not enough history', suggestion: consistencySuggestion },
    { label: 'Income vs Expenses',  score: debtScore,       weight: 10, description: income > 0 ? (expenses <= income ? 'Spending within income' : `Over by ${Math.round((expenses - income))} this month`) : 'No income recorded', suggestion: debtSuggestion },
  ]

  const total = Math.round(
    factors.reduce((sum, f) => sum + f.score * (f.weight / 100), 0)
  )

  const grade: FinancialHealthScore['grade'] =
    total >= 85 ? 'A' :
    total >= 70 ? 'B' :
    total >= 55 ? 'C' :
    total >= 40 ? 'D' : 'F'

  return { total, grade, factors }
}
