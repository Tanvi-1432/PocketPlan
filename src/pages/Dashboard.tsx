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
  positive: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-400' },
  negative: { bg: 'bg-red-50 dark:bg-red-950/40',         text: 'text-red-800 dark:text-red-300',         dot: 'bg-red-400'     },
  warning:  { bg: 'bg-amber-50 dark:bg-amber-950/40',     text: 'text-amber-800 dark:text-amber-300',     dot: 'bg-amber-400'   },
  neutral:  { bg: 'bg-indigo-50 dark:bg-indigo-950/40',   text: 'text-indigo-800 dark:text-indigo-300',   dot: 'bg-indigo-400'  },
}

function NetIcon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const NET_WORTH_CARDS = [
  { label: 'Cash',        key: 'cash' as const,          color: 'text-slate-900 dark:text-slate-100',    iconColor: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',       icon: <NetIcon d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm0 0V7a2 2 0 012-2h2M16 5H8a2 2 0 00-2 2" /> },
  { label: 'Investments', key: 'investments' as const,    color: 'text-indigo-700 dark:text-indigo-300',  iconColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400', icon: <NetIcon d="M3 17l4-8 4 4 4-6 4 3" /> },
  { label: 'Credit Debt', key: 'creditCardDebt' as const, color: 'text-red-600 dark:text-red-400',        iconColor: 'text-red-500 bg-red-50 dark:bg-red-950/50 dark:text-red-400',           icon: <NetIcon d="M1 6h22v13a2 2 0 01-2 2H3a2 2 0 01-2-2V6zm0 5h22" /> },
  { label: 'Net Worth',   key: 'netWorth' as const,       color: 'text-emerald-700 dark:text-emerald-300', iconColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400', icon: <NetIcon d="M12 20V10M18 20V4M6 20v-4" /> },
]

const DISMISSED_KEY = 'pocketplan-onboarding-dismissed'

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { transactions } = useTransactionsStore()
  const { budgets } = useBudgetsStore()
  const { accounts } = useAccountsStore()
  const { holdings } = useInvestmentsStore()
  const { hasData, loadDemoData, clearDemoData } = useDemoData()

  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true'
  )

  const monthKey = currentMonthKey()

  const monthlyTransactions = useMemo(() => filterByMonth(transactions, monthKey), [transactions, monthKey])
  const income    = useMemo(() => getTotalIncome(monthlyTransactions),   [monthlyTransactions])
  const expenses  = useMemo(() => getTotalExpenses(monthlyTransactions), [monthlyTransactions])
  const balance   = useMemo(() => getBalance(monthlyTransactions),       [monthlyTransactions])
  const categoryData       = useMemo(() => groupByCategory(monthlyTransactions.filter((t) => t.type === 'expense')), [monthlyTransactions])
  const monthlyChartData   = useMemo(() => getMonthlyChartData(transactions), [transactions])
  const recentTransactions = useMemo(() => getRecentTransactions(transactions, 5), [transactions])
  const budgetProgress     = useMemo(() => getBudgetProgress(budgets, transactions, monthKey), [budgets, transactions, monthKey])
  const netWorth           = useMemo(() => getNetWorth(accounts), [accounts])
  const portfolioValue     = useMemo(() => getTotalPortfolioValue(holdings), [holdings])
  const insights           = useMemo(() => generateInsights(transactions, budgets, monthKey), [transactions, budgets, monthKey])

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

  function handleDismissOnboarding() {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setOnboardingDismissed(true)
  }

  function handleLoadDemo() {
    loadDemoData()
    handleDismissOnboarding()
  }

  const showOnboarding = !hasData && !onboardingDismissed

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {lastSynced && (
              <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
                {' '}· Synced {new Date(lastSynced).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        {hasData && (
          <button
            onClick={() => setConfirmResetOpen(true)}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-2 self-start sm:self-auto"
          >
            Reset demo data
          </button>
        )}
      </div>

      {/* First-time onboarding */}
      {showOnboarding && (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/60 dark:to-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Welcome to PocketPlan</h2>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1 max-w-lg">
                Explore a simulated personal finance dashboard with budgets, transactions, connected accounts, and investments. No real data required.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Button onClick={handleLoadDemo}>
                  Load demo experience
                </Button>
                <Button variant="secondary" onClick={handleDismissOnboarding}>
                  Start empty
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load demo prompt (minimal, after dismissal) */}
      {!hasData && onboardingDismissed && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">No data yet. Want to explore with sample data?</p>
          <Button variant="secondary" size="sm" onClick={loadDemoData}>Load demo data</Button>
        </div>
      )}

      {/* Net worth banner */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NET_WORTH_CARDS.map(({ label, key, color, iconColor, icon }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm px-4 py-3 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${iconColor}`}>{icon}</div>
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
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Monthly Insights</h2>
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
        <RecentTransactions transactions={recentTransactions} onViewAll={() => onNavigate('transactions')} />
        <BudgetProgressList items={budgetProgress} onViewAll={() => onNavigate('budgets')} />
      </div>

      {/* Reset confirmation modal */}
      <Modal isOpen={confirmResetOpen} onClose={() => setConfirmResetOpen(false)} title="Reset demo data?">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This will remove all demo transactions, budgets, goals, accounts, and investment holdings. Any entries you created manually will also be cleared.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setConfirmResetOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { clearDemoData(); setConfirmResetOpen(false) }}>
              Reset demo data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
