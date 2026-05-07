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
import { computeCashFlowForecast } from '../utils/forecast'
import { getSpendingComparisons } from '../utils/trends'
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
  positive: { bg: 'bg-emerald-50/80 dark:bg-emerald-500/8 border border-emerald-100 dark:border-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-400' },
  negative: { bg: 'bg-red-50/80 dark:bg-red-500/8 border border-red-100 dark:border-red-500/15',                 text: 'text-red-800 dark:text-red-300',         dot: 'bg-red-400'     },
  warning:  { bg: 'bg-amber-50/80 dark:bg-amber-500/8 border border-amber-100 dark:border-amber-500/15',         text: 'text-amber-800 dark:text-amber-300',     dot: 'bg-amber-400'   },
  neutral:  { bg: 'bg-indigo-50/80 dark:bg-indigo-500/8 border border-indigo-100 dark:border-indigo-500/15',     text: 'text-indigo-800 dark:text-indigo-300',   dot: 'bg-indigo-400'  },
}

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
  const forecast           = useMemo(() => computeCashFlowForecast(transactions, budgets, netWorth.cash), [transactions, budgets, netWorth.cash])
  const comparisons        = useMemo(() => getSpendingComparisons(transactions, monthKey).slice(0, 3), [transactions, monthKey])

  const lastSynced = accounts.length > 0
    ? accounts.reduce<string | null>((latest, a) => {
        if (!a.lastSynced) return latest
        if (!latest) return a.lastSynced
        return a.lastSynced > latest ? a.lastSynced : latest
      }, null)
    : null

  const totalNetWorth = netWorth.cash + (portfolioValue || netWorth.investments) - netWorth.creditCardDebt

  function handleDismissOnboarding() {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setOnboardingDismissed(true)
  }

  function handleLoadDemo() {
    loadDemoData()
    handleDismissOnboarding()
  }

  const showOnboarding = !hasData && !onboardingDismissed

  const forecastColor =
    forecast.projectedBalance >= 1000 ? 'text-emerald-400' :
    forecast.projectedBalance >= 0    ? 'text-amber-400' :
                                        'text-red-400'

  return (
    <div className="flex flex-col gap-6">

      {/* ── Onboarding ──────────────────────────────────────────────────── */}
      {showOnboarding && (
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 animate-scale-in"
          style={{ background: 'linear-gradient(135deg, #312e81 0%, #4338ca 40%, #6d28d9 100%)' }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #818cf8 0%, transparent 60%)' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Welcome to PocketPlan</h2>
              <p className="text-sm text-indigo-200 mt-1 max-w-lg">
                Explore a premium personal finance dashboard with budgets, transactions, accounts, and investments. No real data required.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={handleLoadDemo}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-indigo-700 hover:bg-indigo-50 active:scale-[0.97] transition-all duration-150 shadow-lg shadow-indigo-900/30"
                >
                  Load demo experience
                </button>
                <button
                  onClick={handleDismissOnboarding}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-indigo-200 hover:text-white hover:bg-white/10 active:scale-[0.97] transition-all duration-150 border border-white/20"
                >
                  Start empty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load demo prompt (minimal) */}
      {!hasData && onboardingDismissed && (
        <div className="flex items-center justify-between bg-white/80 dark:bg-white/4 backdrop-blur-sm border border-slate-200/60 dark:border-white/8 rounded-2xl px-5 py-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">No data yet. Want to explore with sample data?</p>
          <Button variant="secondary" size="sm" onClick={loadDemoData}>Load demo data</Button>
        </div>
      )}

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      {hasData && (
        <div className="relative overflow-hidden rounded-3xl animate-scale-in"
          style={{ background: 'linear-gradient(135deg, #312e81 0%, #4338ca 35%, #6d28d9 65%, #7e22ce 100%)' }}>
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />
          </div>

          <div className="relative px-6 sm:px-8 pt-7 pb-6">
            {/* Header row */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  {lastSynced && (
                    <span className="hidden sm:inline text-indigo-400">
                      {' '}· Synced {new Date(lastSynced).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white number-display">
                  {formatCurrency(totalNetWorth)}
                </h1>
                <p className="text-indigo-300 text-sm mt-1">Net worth</p>
              </div>
              {hasData && (
                <button
                  onClick={() => setConfirmResetOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-200 transition-colors underline underline-offset-2 mt-1 shrink-0"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Metric pills */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: 'Income', value: income, color: 'text-emerald-300', bg: 'bg-white/8 border-white/12' },
                { label: 'Expenses', value: expenses, color: 'text-red-300', bg: 'bg-white/8 border-white/12' },
                { label: 'Balance', value: balance, color: 'text-white', bg: 'bg-white/15 border-white/20' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`rounded-2xl border px-3 py-3 sm:px-4 sm:py-4 ${bg}`}>
                  <p className="text-[10px] sm:text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-1.5">{label}</p>
                  <p className={`text-base sm:text-xl font-bold number-display truncate ${color}`}>
                    {value < 0 ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
                  </p>
                </div>
              ))}
            </div>

            {/* Forecast strip */}
            {forecast.remainingDays > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-400">Projected month-end:</span>
                  <span className={`text-sm font-bold number-display ${forecastColor}`}>
                    {formatCurrency(forecast.projectedBalance)}
                  </span>
                </div>
                <div className="hidden sm:block w-px bg-white/15" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-400">Safe to spend:</span>
                  <span className="text-sm font-bold text-white number-display">
                    {formatCurrency(forecast.safeToSpendDaily)}<span className="text-xs font-normal text-indigo-300">/day</span>
                  </span>
                </div>
                <div className="hidden sm:block w-px bg-white/15" />
                <span className="text-xs text-indigo-400 self-center">{forecast.remainingDays} days left · {forecast.confidence} confidence</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback page title when no hero */}
      {!hasData && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      {/* ── Net worth breakdown ──────────────────────────────────────────── */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
          {[
            { label: 'Cash',        value: netWorth.cash,                                        color: 'text-slate-800 dark:text-slate-100', accent: '#6366f1', iconD: 'M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm0 0V7a2 2 0 012-2h2M16 5H8a2 2 0 00-2 2' },
            { label: 'Investments', value: portfolioValue || netWorth.investments,                color: 'text-indigo-700 dark:text-indigo-300', accent: '#6366f1', iconD: 'M3 17l4-8 4 4 4-6 4 3' },
            { label: 'Credit Debt', value: netWorth.creditCardDebt,                              color: 'text-red-600 dark:text-red-400',       accent: '#ef4444', iconD: 'M1 6h22v13a2 2 0 01-2 2H3a2 2 0 01-2-2V6zm0 5h22' },
            { label: 'Net Worth',   value: netWorth.cash + (portfolioValue || netWorth.investments) - netWorth.creditCardDebt, color: 'text-emerald-700 dark:text-emerald-300', accent: '#10b981', iconD: 'M12 20V10M18 20V4M6 20v-4' },
          ].map(({ label, value, color, accent, iconD }) => (
            <div key={label} className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-white/6 shadow-card px-4 py-3.5 hover:shadow-panel hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}18` }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d={iconD} />
                  </svg>
                </div>
              </div>
              <p className={`text-base font-bold number-display ${color}`}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Monthly summary cards (when no hero) ────────────────────────── */}
      {!hasData && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard label="Income" amount={income} variant="income" />
          <SummaryCard label="Expenses" amount={expenses} variant="expense" />
          <SummaryCard label="Balance" amount={balance} variant="balance" />
        </div>
      )}

      {/* ── Month-over-month spending changes ────────────────────────────── */}
      {comparisons.length > 0 && (
        <section className="animate-slide-up stagger-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Spending vs Last Month</h2>
            <button onClick={() => onNavigate('analytics')} className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              View analytics →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {comparisons.map((c) => {
              const up = c.delta > 0
              const neutral = Math.abs(c.delta) < 1
              return (
                <div key={c.category} className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-white/6 px-4 py-3.5 shadow-card">
                  <p className="text-xs text-slate-400 dark:text-slate-500">{c.category}</p>
                  <p className="text-sm font-semibold number-display text-slate-800 dark:text-slate-200 mt-0.5">{formatCurrency(c.thisMonth)}</p>
                  <span className={`text-xs font-medium ${
                    neutral ? 'text-slate-400' :
                    up ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {neutral ? 'No change' : `${up ? '↑' : '↓'} ${Math.abs(c.delta).toFixed(0)}% vs last month`}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Insights ─────────────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <section className="animate-slide-up stagger-2">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Monthly Insights</h2>
          <div className="flex flex-col gap-2">
            {insights.map((insight) => {
              const c = INSIGHT_COLORS[insight.type]
              return (
                <div key={insight.id} className={`flex items-start gap-3 rounded-xl px-4 py-3 ${c.bg}`}>
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                  <p className={`text-sm ${c.text}`}>{insight.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up stagger-3">
        <CategoryChart data={categoryData} />
        <MonthlyChart data={monthlyChartData} />
      </div>

      {/* ── Recent activity ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up stagger-4">
        <RecentTransactions transactions={recentTransactions} onViewAll={() => onNavigate('transactions')} />
        <BudgetProgressList items={budgetProgress} onViewAll={() => onNavigate('budgets')} />
      </div>

      {/* ── Reset confirmation modal ─────────────────────────────────────── */}
      <Modal isOpen={confirmResetOpen} onClose={() => setConfirmResetOpen(false)} title="Reset demo data?">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This will remove all demo transactions, budgets, goals, accounts, and investment holdings. Any entries you created manually will also be cleared.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setConfirmResetOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { clearDemoData(); setOnboardingDismissed(false); setConfirmResetOpen(false) }}>
              Reset demo data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
