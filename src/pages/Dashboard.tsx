import { useMemo } from 'react'
import type { Page } from '../components/Layout'
import { useTransactionsStore } from '../store/transactions'
import { useBudgetsStore } from '../store/budgets'
import { useAccountsStore } from '../store/accounts'
import { useInvestmentsStore } from '../store/investments'
import {
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  filterByMonth,
  groupByCategory,
  getMonthlyChartData,
  getRecentTransactions,
  currentMonthKey,
  formatCurrency,
} from '../utils'
import { getBudgetProgress } from '../utils/budgets'
import { getNetWorth, getTotalPortfolioValue } from '../utils/investments'
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
  const { accounts } = useAccountsStore()
  const { holdings } = useInvestmentsStore()

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

  const monthlyChartData   = useMemo(() => getMonthlyChartData(transactions), [transactions])
  const recentTransactions = useMemo(() => getRecentTransactions(transactions, 5), [transactions])
  const budgetProgress     = useMemo(() => getBudgetProgress(budgets, transactions, monthKey), [budgets, transactions, monthKey])

  const netWorth      = useMemo(() => getNetWorth(accounts), [accounts])
  const portfolioValue = useMemo(() => getTotalPortfolioValue(holdings), [holdings])

  const lastSynced = accounts.length > 0
    ? accounts.reduce<string | null>((latest, a) => {
        if (!a.lastSynced) return latest
        if (!latest) return a.lastSynced
        return a.lastSynced > latest ? a.lastSynced : latest
      }, null)
    : null

  const hasAccountData = accounts.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your financial snapshot for this month</p>
        </div>
        {lastSynced && (
          <p className="text-xs text-gray-400 mt-1">
            Last synced {new Date(lastSynced).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Net worth banner — only when accounts are connected */}
      {hasAccountData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Cash',        value: netWorth.cash,           color: 'text-gray-900' },
            { label: 'Investments', value: portfolioValue || netWorth.investments, color: 'text-indigo-700' },
            { label: 'Credit Debt', value: netWorth.creditCardDebt, color: 'text-red-600' },
            { label: 'Net Worth',   value: netWorth.netWorth,       color: 'text-emerald-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
              <p className="text-xs text-gray-500 mb-0.5">{label}</p>
              <p className={`text-base font-bold ${color}`}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Monthly summary cards */}
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
