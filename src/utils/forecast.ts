import type { Transaction, Budget, CashFlowForecast } from '../types'
import { filterByMonth, getTotalIncome, getTotalExpenses } from './transactions'
import { currentMonthKey } from './date'

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function dayOfMonth(): number {
  return new Date().getDate()
}

export function computeCashFlowForecast(
  transactions: Transaction[],
  budgets: Budget[],
  cashBalance: number,
): CashFlowForecast {
  const monthKey = currentMonthKey()
  const monthTxs = filterByMonth(transactions, monthKey)

  const incomeToDate   = getTotalIncome(monthTxs)
  const expensesToDate = getTotalExpenses(monthTxs)
  const balanceToDate  = incomeToDate - expensesToDate

  const now    = new Date()
  const year   = now.getFullYear()
  const month  = now.getMonth() + 1
  const total  = daysInMonth(year, month)
  const day    = dayOfMonth()
  const remaining = total - day

  if (remaining <= 0) {
    return {
      projectedBalance: balanceToDate,
      remainingDays: 0,
      projectedIncome: incomeToDate,
      projectedExpenses: expensesToDate,
      safeToSpendDaily: 0,
      confidence: 'high',
    }
  }

  // Daily average spend so far this month
  const avgDailyExpense = day > 0 ? expensesToDate / day : 0

  // Recurring income not yet received this month — look for income-type recurring in transactions
  const recurringIncome = transactions
    .filter((t) => t.isRecurring && t.type === 'income' && t.recurringFrequency === 'monthly')
    .reduce((sum, t) => {
      // Only count if it hasn't appeared this month yet
      const appearedThisMonth = monthTxs.some((m) => m.recurringSeriesId === t.recurringSeriesId && m.type === 'income')
      return appearedThisMonth ? sum : sum + t.amount
    }, 0)

  // Remaining recurring expenses from recurring transactions flagged in the store
  const recurringExpenses = transactions
    .filter((t) => t.isRecurring && t.type === 'expense' && t.recurringFrequency === 'monthly')
    .reduce((sum, t) => {
      const appearedThisMonth = monthTxs.some((m) => m.recurringSeriesId === t.recurringSeriesId && m.type === 'expense')
      return appearedThisMonth ? sum : sum + t.amount
    }, 0)

  // Budget-based remaining expense estimate (conservative)
  const budgetBasedRemaining = budgets
    .filter((b) => b.month === monthKey)
    .reduce((sum, b) => {
      const spent = monthTxs
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((s, t) => s + t.amount, 0)
      const rem = Math.max(0, b.limit - spent)
      return sum + rem
    }, 0)

  const projectedAdditionalExpenses = Math.max(
    recurringExpenses + avgDailyExpense * remaining * 0.5,
    budgetBasedRemaining * 0.7,
  )

  const projectedIncome    = incomeToDate + recurringIncome
  const projectedExpenses  = expensesToDate + projectedAdditionalExpenses
  const projectedBalance   = cashBalance + (projectedIncome - projectedExpenses)

  // Safe to spend: (current cash + expected income - committed expenses) / remaining days
  const committed = recurringExpenses + budgetBasedRemaining * 0.3
  const available = Math.max(0, cashBalance - committed)
  const safeToSpendDaily = remaining > 0 ? available / remaining : 0

  const confidence: CashFlowForecast['confidence'] =
    transactions.length > 20 ? 'high' : transactions.length > 8 ? 'medium' : 'low'

  return {
    projectedBalance,
    remainingDays: remaining,
    projectedIncome,
    projectedExpenses,
    safeToSpendDaily,
    confidence,
  }
}
