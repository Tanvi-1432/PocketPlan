import { useMemo, useState } from 'react'
import type { Page } from '../components/Layout'
import { useTransactionsStore } from '../store/transactions'
import { useBudgetsStore } from '../store/budgets'
import { useAccountsStore } from '../store/accounts'
import { useInvestmentsStore } from '../store/investments'
import { useDemoData } from '../hooks'
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
  generateInsights,
} from '../utils'
import { getBudgetProgress } from '../utils/budgets'
import { getNetWorth, getTotalPortfolioValue } from '../utils/investments'
import SummaryCard from '../components/dashboard/SummaryCard'
import CategoryChart from '../components/dashboard/CategoryChart'
import MonthlyChart from '../components/dashboard/MonthlyChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import BudgetProgressList from '../components/dashboard/BudgetProgressList'
import { Button, Modal } from '../components/ui'

interface DashboardProps {
  onNavigate: (page: Page) => void
}

const INSIGHT_COLORS = {
  positive: { bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-800', dot: 'bg-emerald-400' },
  negative: { bar: 'bg-red-500',     bg: 'bg-red-50',     text: 'text-red-800',     dot: 'bg-red-400'     },
  warning:  { bar: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-800',   dot: 'bg-amber-400'   },
  neutral:  { bar: 'bg-indigo-400',  bg: 'bg-indigo-50',  text: 'text-indigo-800',  dot: 'bg-indigo-400'  },
}

// Simple SVG icon helper for net-worth cards
function NetIcon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const NET_WORTH_CARDS = [
  {
    label: 'Cash',
    key: 'cash' as const,
    color: 'text-gray-900',
    iconColor: 'text-gray-500 bg-gray-100',
    icon: <NetIcon d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm0 0V7a2 2 0 012-2h2M16 5H8a2 2 0 00-2 2" />,
  },
  {
    label: 'Investments',
    key: 'investments' as const,
    color: 'text-indigo-700',
    iconColor: 'text-indigo-600 bg-indigo-50',
    icon: <NetIcon d="M3 17l4-8 4 4 4-6 4 3" />,
  },
  {
    label: 'Credit Debt',
    key: 'creditCardDebt' as const,
    color: 'text-red-600',
    iconColor: 'text-red-500 bg-red-50',
    icon: <NetIcon d="M1 6h22v13a2 2 0 01-2 2H3a2 2 0 01-2-2V6zm0 5h22" />,
  },
  {
    label: 'Net Worth',
    key: 'netWorth' as const,
    color: 'text-emerald-700',
    iconColor: 'text-emerald-600 bg-emerald-50',
    icon: <NetIcon d="M12 20V10M18 20V4M6 20v-4" />,
  },
]

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { transactions } = useTransactionsStore()
  const { budgets } = useBudgetsStore()
  const { accounts } = useAccountsStore()
  const { holdings } = useInvestmentsStore()
  const { hasData, loadDemoData, clearAllData } = useDemoData()

  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  const monthKey = currentMonthKey()

  const monthlyTransactions = useMemo(
    () => filterByMonth(transactions, monthKey),
    [transactions, monthKey]
  )

  const income    = useMemo(() => getTotalIncome(monthlyTransactions),   [monthlyTransactions])
  const expenses  = useMemo(() => getTotalExpenses(monthlyTransactions), [monthlyTransactions])
  const balance   = useMemo(() => getBalance(monthlyTransactions),       [monthlyTransactions])

  const categoryData       = useMemo(() => groupByCategory(monthlyTransactions.filter((t) => t.type === 'expense')), [monthlyTransactions])
  const monthlyChartData   = useMemo(() => getMonthlyChartData(transactions), [transactions])
  const recentTransactions = useMemo(() => getRecentTransactions(transactions, 5), [transactions])
  const budgetProgress     = useMemo(() => getBudgetProgress(budgets, transactions, monthKey), [budgets, transactions, monthKey])

  const netWorth       = useMemo(() => getNetWorth(accounts), [accounts])
  const portfolioValue = useMemo(() => getTotalPortfolioValue(holdings), [holdings])

  const insights = useMemo(() => generateInsights(transactions, budgets, monthKey), [transactions, budgets, monthKey])

  const lastSynced = accounts.length > 0
    ? accounts.reduce<string | null>((latest, a) => {
        if (!a.lastSynced) return latest
        if (!latest) return a.lastSynced
        return a.lastSynced > latest ? a.lastSynced : latest
      }, null)
    : null

  const netWorthValues = {
    cash: netWorth.cash,
    investments: portfolioValue || netWorth.investments,
    creditCardDebt: netWorth.creditCardDebt,
    netWorth: netWorth.netWorth,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {lastSynced && (
              <span className="hidden sm:inline text-gray-400">
                {' '}· Synced {new Date(lastSynced).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hasData ? (
            <Button variant="secondary" size="sm" onClick={loadDemoData}>
              Load demo data
            </Button>
          ) : (
            <button
              onClick={() => setConfirmClearOpen(true)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
            >
              Reset data
            </button>
          )}
        </div>
      </div>

      {/* Net worth banner — only when accounts are connected */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NET_WORTH_CARDS.map(({ label, key, color, iconColor, icon }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{label}</p>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${iconColor}`}>
                  {icon}
                </div>
              </div>
              <p className={`text-lg font-bold ${color}`}>{formatCurrency(netWorthValues[key])}</p>
            </div>
          ))}
        </div>
      )}

      {/* Monthly summary cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <SummaryCard label="Income" amount={income} variant="income" />
        <SummaryCard label="Expenses" amount={expenses} variant="expense" />
        <SummaryCard label="Balance" amount={balance} variant="balance" />
      </div>

      {/* Monthly insights */}
      {insights.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Monthly Insights</h2>
          <div className="flex flex-col gap-2">
            {insights.map((insight) => {
              const c = INSIGHT_COLORS[insight.type]
              return (
                <div key={insight.id} className={`flex items-start gap-3 rounded-lg px-4 py-3 ${c.bg}`}>
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                  <p className={`text-sm ${c.text}`}>{insight.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryChart data={categoryData} />
        <MonthlyChart data={monthlyChartData} />
      </div>

      {/* Recent activity */}
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

      {/* Confirm clear modal */}
      <Modal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Reset all data?"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-600">
            This will permanently delete all transactions, budgets, goals, accounts, and investment holdings. This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setConfirmClearOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => { clearAllData(); setConfirmClearOpen(false) }}
            >
              Yes, reset everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
