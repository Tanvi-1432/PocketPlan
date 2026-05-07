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
  positive: { wrapper: 'border border-emerald-200/60 dark:border-emerald-500/15', bg: 'bg-emerald-50/60 dark:bg-emerald-500/6', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-400' },
  negative: { wrapper: 'border border-rose-200/60 dark:border-rose-500/15',       bg: 'bg-rose-50/60 dark:bg-rose-500/6',       text: 'text-rose-700 dark:text-rose-300',     dot: 'bg-rose-400'    },
  warning:  { wrapper: 'border border-amber-200/60 dark:border-amber-500/15',     bg: 'bg-amber-50/60 dark:bg-amber-500/6',     text: 'text-amber-700 dark:text-amber-300',   dot: 'bg-amber-400'   },
  neutral:  { wrapper: 'border border-violet-200/60 dark:border-violet-500/15',   bg: 'bg-violet-50/60 dark:bg-violet-500/6',   text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-400'  },
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

  const forecastTextColor =
    forecast.projectedBalance >= 1000 ? 'text-emerald-600 dark:text-emerald-400' :
    forecast.projectedBalance >= 0    ? 'text-amber-600 dark:text-amber-400' :
                                        'text-rose-500 dark:text-rose-400'

  return (
    <div className="flex flex-col gap-5">

      {/* ── Onboarding card ─────────────────────────────────────────────── */}
      {showOnboarding && (
        <div className="hero-glass p-6 sm:p-8 animate-scale-in">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(167,139,250,0.20)', border: '1px solid rgba(167,139,250,0.30)' }}>
              <svg className="w-7 h-7 text-violet-600 dark:text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Welcome to PocketPlan</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                Explore a premium personal finance dashboard with budgets, transactions, accounts, and investments. No real data required.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={handleLoadDemo}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.97]"
                  style={{ background: 'rgba(109,40,217,0.85)', color: '#fff', boxShadow: '0 4px 16px rgba(139,92,246,0.25)' }}
                >
                  Load demo experience
                </button>
                <button
                  onClick={handleDismissOnboarding}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 active:scale-[0.97] transition-all duration-150"
                  style={{ background: 'rgba(255,255,255,0.50)', border: '1px solid rgba(200,200,230,0.40)' }}
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
        <div className="card flex items-center justify-between px-5 py-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">No data yet. Want to explore with sample data?</p>
          <Button variant="secondary" size="sm" onClick={loadDemoData}>Load demo data</Button>
        </div>
      )}

      {/* ── Hero card ────────────────────────────────────────────────────── */}
      {hasData && (
        <div className="hero-glass px-6 sm:px-7 pt-6 pb-5 animate-scale-in relative overflow-hidden">
          {/* Subtle inner highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-[1.75rem]"
            style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255,255,255,0.18), transparent)' }} />

          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {lastSynced && (
                  <span className="hidden sm:inline">
                    {' '}· Synced {new Date(lastSynced).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                )}
              </p>
              <p className="text-3xl sm:text-4xl font-bold number-display text-slate-800 dark:text-slate-100 leading-none">
                {formatCurrency(totalNetWorth)}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Net worth</p>
            </div>
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="text-xs text-slate-400 hover:text-rose-400 dark:hover:text-rose-400 transition-colors mt-1 shrink-0"
            >
              Reset
            </button>
          </div>

          {/* Metric pills */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Income',   value: income,   dotColor: '#34d399' },
              { label: 'Expenses', value: expenses,  dotColor: '#f87171' },
              { label: 'Balance',  value: balance,   dotColor: '#a78bfa' },
            ].map(({ label, value, dotColor }) => (
              <div key={label} className="rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5"
                style={{ background: 'rgba(255,255,255,0.28)', border: '1px solid rgba(255,255,255,0.40)' }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{label}</p>
                </div>
                <p className="text-sm sm:text-lg font-bold number-display text-slate-800 dark:text-slate-100 truncate">
                  {value < 0 ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
                </p>
              </div>
            ))}
          </div>

          {/* Forecast strip */}
          {forecast.remainingDays > 0 && (
            <div className="mt-4 pt-4 flex flex-wrap gap-x-5 gap-y-1"
              style={{ borderTop: '1px solid rgba(200,200,230,0.30)' }}>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Projected:</span>
                <span className={`text-sm font-semibold number-display ${forecastTextColor}`}>
                  {formatCurrency(forecast.projectedBalance)}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Safe/day:</span>
                <span className="text-sm font-semibold number-display text-slate-700 dark:text-slate-200">
                  {formatCurrency(forecast.safeToSpendDaily)}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 self-end">{forecast.remainingDays}d left · {forecast.confidence}</span>
            </div>
          )}
        </div>
      )}

      {/* Page title when no hero (empty state) */}
      {!hasData && (
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* ── Net worth breakdown ──────────────────────────────────────────── */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
          {[
            { label: 'Cash',        value: netWorth.cash,                                                                    accent: '#a78bfa', iconD: 'M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm0 0V7a2 2 0 012-2h2M16 5H8a2 2 0 00-2 2' },
            { label: 'Investments', value: portfolioValue || netWorth.investments,                                            accent: '#60a5fa', iconD: 'M3 17l4-8 4 4 4-6 4 3' },
            { label: 'Credit Debt', value: netWorth.creditCardDebt,                                                          accent: '#f87171', iconD: 'M1 6h22v13a2 2 0 01-2 2H3a2 2 0 01-2-2V6zm0 5h22' },
            { label: 'Net Worth',   value: netWorth.cash + (portfolioValue || netWorth.investments) - netWorth.creditCardDebt, accent: '#34d399', iconD: 'M12 20V10M18 20V4M6 20v-4' },
          ].map(({ label, value, accent, iconD }) => (
            <div key={label} className="card px-4 py-3.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{label}</p>
                <div className="w-6 h-6 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d={iconD} />
                  </svg>
                </div>
              </div>
              <p className="text-base font-bold number-display text-slate-800 dark:text-slate-100">{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Monthly summary cards when no hero */}
      {!hasData && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard label="Income"   amount={income}   variant="income" />
          <SummaryCard label="Expenses" amount={expenses} variant="expense" />
          <SummaryCard label="Balance"  amount={balance}  variant="balance" />
        </div>
      )}

      {/* ── Month-over-month ─────────────────────────────────────────────── */}
      {comparisons.length > 0 && (
        <section className="animate-slide-up stagger-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Spending vs Last Month</h2>
            <button onClick={() => onNavigate('analytics')} className="text-xs text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              Analytics →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {comparisons.map((c) => {
              const up = c.delta > 0
              const neutral = Math.abs(c.delta) < 1
              return (
                <div key={c.category} className="card px-4 py-3.5">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{c.category}</p>
                  <p className="text-sm font-semibold number-display text-slate-800 dark:text-slate-200">{formatCurrency(c.thisMonth)}</p>
                  <span className={`text-xs font-medium mt-0.5 block ${
                    neutral ? 'text-slate-400' :
                    up ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
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
          <h2 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Monthly Insights</h2>
          <div className="flex flex-col gap-2">
            {insights.map((insight) => {
              const c = INSIGHT_COLORS[insight.type]
              return (
                <div key={insight.id} className={`flex items-start gap-3 rounded-2xl px-4 py-3 ${c.bg} ${c.wrapper}`}>
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

      {/* ── Reset modal ──────────────────────────────────────────────────── */}
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
