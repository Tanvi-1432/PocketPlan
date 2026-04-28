import { useMemo } from 'react'
import type { Page } from '../components/Layout'
import { useTransactionsStore } from '../store/transactions'
import { useBudgetsStore } from '../store/budgets'
import {
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  filterByMonth,
  groupByCategory,
  getMonthlyChartData,
  getRecentTransactions,
  currentMonthKey,
} from '../utils'
import { getBudgetProgress } from '../utils/budgets'
import SummaryCard from '../components/dashboard/SummaryCard'
import CategoryChart from '../components/dashboard/CategoryChart'
import MonthlyChart from '../components/dashboard/MonthlyChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import BudgetProgressList from '../components/dashboard/BudgetProgressList'

interface DashboardProps {
  onNavigate: (page: Page) => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { transactions } = useTransactionsStore()
  const { budgets } = useBudgetsStore()

  const monthKey = currentMonthKey()

  const monthlyTransactions = useMemo(
    () => filterByMonth(transactions, monthKey),
    [transactions, monthKey]
  )

  const income   = useMemo(() => getTotalIncome(monthlyTransactions),   [monthlyTransactions])
  const expenses = useMemo(() => getTotalExpenses(monthlyTransactions), [monthlyTransactions])
  const balance  = useMemo(() => getBalance(monthlyTransactions),       [monthlyTransactions])

  const categoryData = useMemo(
    () => groupByCategory(monthlyTransactions.filter((t) => t.type === 'expense')),
    [monthlyTransactions]
  )

  const monthlyChartData = useMemo(() => getMonthlyChartData(transactions), [transactions])
  const recentTransactions = useMemo(() => getRecentTransactions(transactions, 5), [transactions])

  const budgetProgress = useMemo(
    () => getBudgetProgress(budgets, transactions, monthKey),
    [budgets, transactions, monthKey]
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your financial snapshot for this month</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Income" amount={income} variant="income" />
        <SummaryCard label="Expenses" amount={expenses} variant="expense" />
        <SummaryCard label="Balance" amount={balance} variant="balance" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryChart data={categoryData} />
        <MonthlyChart data={monthlyChartData} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTransactions
          transactions={recentTransactions}
          onViewAll={() => onNavigate('transactions')}
        />
        <BudgetProgressList
          items={budgetProgress}
          onViewAll={() => onNavigate('budgets')}
        />
      </div>
    </div>
  )
}
