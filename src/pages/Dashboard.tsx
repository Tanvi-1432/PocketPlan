import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactionsStore } from '../store/transactions'
import { useBudgetsStore } from '../store/budgets'
import { useAccountsStore } from '../store/accounts'
import { useInvestmentsStore } from '../store/investments'
import { useDemoData } from '../hooks'
import {
  filterByMonth,
  groupByCategory,
  getMonthlyChartData,
  getRecentTransactions,
  currentMonthKey,
  formatCurrency,
  generateInsights,
} from '../utils'
import { getBudgetProgress } from '../utils/budgets'
import {
  calculateMonthlyBalance,
  calculateMonthlyExpenses,
  calculateMonthlyIncome,
  calculateNetWorth,
  validateFinancialTotals,
} from '../utils/financialTotals'
import { computeCashFlowForecast } from '../utils/forecast'
import { getSpendingComparisons } from '../utils/trends'
import SummaryCard from '../components/dashboard/SummaryCard'
import CategoryChart from '../components/dashboard/CategoryChart'
import MonthlyChart from '../components/dashboard/MonthlyChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import BudgetProgressList from '../components/dashboard/BudgetProgressList'
import { Button } from '../components/ui'

const INSIGHT_COLORS = {
  positive: {
    bg: 'rgba(52,211,153,0.10)',
    border: 'rgba(52,211,153,0.20)',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: '#34d399',
  },
  negative: {
    bg: 'rgba(251,113,133,0.10)',
    border: 'rgba(251,113,133,0.20)',
    text: 'text-rose-700 dark:text-rose-300',
    dot: '#fb7185',
  },
  warning: {
    bg: 'rgba(251,191,36,0.10)',
    border: 'rgba(251,191,36,0.20)',
    text: 'text-amber-700 dark:text-amber-300',
    dot: '#fbbf24',
  },
  neutral: {
    bg: 'rgba(167,139,250,0.10)',
    border: 'rgba(167,139,250,0.20)',
    text: 'text-violet-700 dark:text-violet-300',
    dot: '#a78bfa',
  },
}

const DISMISSED_KEY = 'pocketplan-onboarding-dismissed'

export default function Dashboard() {
  const navigate = useNavigate()
  const { transactions } = useTransactionsStore()
  const { budgets } = useBudgetsStore()
  const { accounts } = useAccountsStore()
  const { holdings } = useInvestmentsStore()
  const { hasData, loadDemoData } = useDemoData()

  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true'
  )

  const monthKey = currentMonthKey()

  const monthlyTransactions = useMemo(() => filterByMonth(transactions, monthKey), [transactions, monthKey])
  const income    = useMemo(() => calculateMonthlyIncome(transactions, monthKey),   [transactions, monthKey])
  const expenses  = useMemo(() => calculateMonthlyExpenses(transactions, monthKey), [transactions, monthKey])
  const balance   = useMemo(() => calculateMonthlyBalance(transactions, monthKey),  [transactions, monthKey])
  const categoryData       = useMemo(() => groupByCategory(monthlyTransactions.filter((t) => t.type === 'expense')), [monthlyTransactions])
  const monthlyChartData   = useMemo(() => getMonthlyChartData(transactions), [transactions])
  const recentTransactions = useMemo(() => getRecentTransactions(transactions, 5), [transactions])
  const budgetProgress     = useMemo(() => getBudgetProgress(budgets, transactions, monthKey), [budgets, transactions, monthKey])
  const netWorth           = useMemo(() => calculateNetWorth(accounts, holdings), [accounts, holdings])
  const insights           = useMemo(() => generateInsights(transactions, budgets, monthKey), [transactions, budgets, monthKey])
  const forecast           = useMemo(() => computeCashFlowForecast(transactions, budgets, netWorth.cash), [transactions, budgets, netWorth.cash])
  const comparisons        = useMemo(() => getSpendingComparisons(transactions, monthKey).slice(0, 3), [transactions, monthKey])

  useEffect(() => {
    validateFinancialTotals({ accounts, holdings })
  }, [accounts, holdings])

  const lastSynced = accounts.length > 0
    ? accounts.reduce<string | null>((latest, a) => {
        if (!a.lastSynced) return latest
        if (!latest) return a.lastSynced
        return a.lastSynced > latest ? a.lastSynced : latest
      }, null)
    : null

  function handleDismissOnboarding() {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setOnboardingDismissed(true)
  }

  function handleLoadDemo() {
    loadDemoData()
    handleDismissOnboarding()
  }

  const showOnboarding = !hasData && !onboardingDismissed
  const forecastIsPositive = forecast.projectedBalance >= 1000
  const forecastIsWarn     = forecast.projectedBalance >= 0 && forecast.projectedBalance < 1000

  return (
    <div className="flex flex-col gap-5">

      {/* ── Onboarding ────────────────────────────────────────────────── */}
      {showOnboarding && (
        <div className="animate-scale-in rounded-3xl overflow-hidden p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.28), rgba(129,140,248,0.22), rgba(96,165,250,0.20))',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.50)',
            boxShadow: '0 8px 40px rgba(167,139,250,0.18)',
          }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.30)', border: '1px solid rgba(255,255,255,0.50)' }}>
              <svg className="w-7 h-7 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Welcome to PocketPlan</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-lg">
                A personal finance dashboard with budgets, transactions, accounts, and investments.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={handleLoadDemo}
                  className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-150 active:scale-[0.97]"
                  style={{ background: 'rgba(255,255,255,0.75)', color: '#6d28d9', border: '1px solid rgba(255,255,255,0.80)', boxShadow: '0 2px 12px rgba(167,139,250,0.15)' }}
                >
                  Load demo experience
                </button>
                <button
                  onClick={handleDismissOnboarding}
                  className="px-4 py-2 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 active:scale-[0.97]"
                  style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.40)' }}
                >
                  Start empty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimal no-data prompt */}
      {!hasData && onboardingDismissed && (
        <div className="flex items-center justify-between glass-card px-5 py-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">No data yet. Want to explore with sample data?</p>
          <Button variant="secondary" size="sm" onClick={loadDemoData}>Load demo data</Button>
        </div>
      )}

      {/* ── Hero card ─────────────────────────────────────────────────── */}
      {hasData && (
        <div className="animate-scale-in rounded-3xl overflow-hidden relative hero-pastel hero-pastel-light dark:hero-pastel-dark"
          style={{ padding: '1.5rem 1.75rem' }}>

          {/* Decorative orb */}
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)', transform: 'translate(25%, -25%)' }} />

          {/* Header row */}
          <div className="relative mb-5">
            <p className="text-xs font-medium tracking-widest uppercase mb-2 text-violet-600 dark:text-violet-300">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {lastSynced && (
                <span className="hidden sm:inline text-violet-400 dark:text-violet-400">
                  {' '}· Synced {new Date(lastSynced).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              )}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold number-display text-violet-900 dark:text-white"
              style={{ letterSpacing: '-0.03em' }}>
              {formatCurrency(netWorth.netWorth)}
            </h1>
            <p className="text-sm mt-1 text-violet-500 dark:text-violet-300">Net worth</p>
          </div>

          {/* Metric pills — min-w-0 + break-all prevents financial value truncation */}
          <div className="relative grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Income',   value: income,   cls: 'text-emerald-700 dark:text-emerald-300' },
              { label: 'Expenses', value: expenses, cls: 'text-rose-700 dark:text-rose-300'       },
              { label: 'Balance',  value: balance,  cls: 'text-violet-900 dark:text-white'         },
            ].map(({ label, value, cls }) => (
              <div key={label} className="rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 min-w-0"
                style={{ background: 'rgba(255,255,255,0.28)', border: '1px solid rgba(255,255,255,0.45)' }}>
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 text-violet-500 dark:text-violet-300">
                  {label}
                </p>
                <p className={`text-sm sm:text-base font-bold number-display leading-tight break-all ${cls}`}>
                  {value < 0 ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
                </p>
              </div>
            ))}
          </div>

          {/* Forecast strip */}
          {forecast.remainingDays > 0 && (
            <div className="relative mt-4 pt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-white/40 dark:border-white/15">
              <div className="flex items-center gap-2">
                <span className="text-xs text-violet-500 dark:text-violet-300">Month-end forecast</span>
                <span className={`text-sm font-bold number-display ${
                  forecastIsPositive ? 'text-emerald-700 dark:text-emerald-300'
                  : forecastIsWarn   ? 'text-amber-700 dark:text-amber-300'
                                     : 'text-rose-700 dark:text-rose-300'
                }`}>
                  {formatCurrency(forecast.projectedBalance)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-violet-500 dark:text-violet-300">Safe to spend</span>
                <span className="text-sm font-bold number-display text-violet-900 dark:text-white">
                  {formatCurrency(forecast.safeToSpendDaily)}
                  <span className="text-xs font-normal text-violet-400 dark:text-violet-300">/day</span>
                </span>
              </div>
              <span className="text-xs self-center text-violet-400 dark:text-violet-400">
                {forecast.remainingDays} days left
              </span>
            </div>
          )}
        </div>
      )}

      {/* Fallback page title when no data */}
      {!hasData && (
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* ── Net worth breakdown ───────────────────────────────────────── */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
          {[
            { label: 'Cash',        value: netWorth.cash,           accentBg: 'rgba(148,163,184,0.12)', accentBorder: 'rgba(148,163,184,0.22)', accentIcon: '#94a3b8', textColor: 'text-slate-700 dark:text-slate-200',       iconD: 'M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm0 0V7a2 2 0 012-2h2M16 5H8a2 2 0 00-2 2' },
            { label: 'Investments', value: netWorth.investments,    accentBg: 'rgba(129,140,248,0.14)', accentBorder: 'rgba(129,140,248,0.25)', accentIcon: '#6366f1', textColor: 'text-indigo-700 dark:text-indigo-300',    iconD: 'M3 17l4-8 4 4 4-6 4 3' },
            { label: 'Credit Debt', value: netWorth.creditCardDebt, accentBg: 'rgba(251,113,133,0.12)', accentBorder: 'rgba(251,113,133,0.22)', accentIcon: '#f43f5e', textColor: 'text-rose-600 dark:text-rose-400',         iconD: 'M1 6h22v13a2 2 0 01-2 2H3a2 2 0 01-2-2V6zm0 5h22' },
            { label: 'Net Worth',   value: netWorth.netWorth,       accentBg: 'rgba(52,211,153,0.12)',  accentBorder: 'rgba(52,211,153,0.22)',  accentIcon: '#10b981', textColor: 'text-emerald-700 dark:text-emerald-300', iconD: 'M12 20V10M18 20V4M6 20v-4' },
          ].map(({ label, value, accentBg, accentBorder, accentIcon, textColor, iconD }) => (
            <div key={label} className="glass-card hover-lift px-4 py-3.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
                <div className="w-6 h-6 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: accentBg, border: `1px solid ${accentBorder}`, color: accentIcon }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d={iconD} />
                  </svg>
                </div>
              </div>
              <p className={`text-base font-bold number-display ${textColor}`}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Monthly summary cards (no-data fallback) */}
      {!hasData && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard label="Income" amount={income} variant="income" />
          <SummaryCard label="Expenses" amount={expenses} variant="expense" />
          <SummaryCard label="Balance" amount={balance} variant="balance" />
        </div>
      )}

      {/* ── Recent activity (actionable — above charts) ───────────────── */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up stagger-1">
          <RecentTransactions transactions={recentTransactions} onViewAll={() => navigate('/transactions')} />
          <BudgetProgressList items={budgetProgress} onViewAll={() => navigate('/budgets')} />
        </div>
      )}

      {/* ── Month-over-month ──────────────────────────────────────────── */}
      {comparisons.length > 0 && (
        <section className="animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Spending vs Last Month</h2>
            <button onClick={() => navigate('/analytics')} className="text-xs text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              Full analytics →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {comparisons.map((c) => {
              const up = c.delta > 0
              const neutral = Math.abs(c.delta) < 1
              return (
                <div key={c.category} className="glass-card px-4 py-3.5">
                  <p className="text-xs text-slate-400 dark:text-slate-500">{c.category}</p>
                  <p className="text-sm font-semibold number-display text-slate-700 dark:text-slate-200 mt-0.5">{formatCurrency(c.thisMonth)}</p>
                  <span className={`text-xs font-medium ${neutral ? 'text-slate-400' : up ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {neutral ? 'No change' : `${up ? '↑' : '↓'} ${Math.abs(c.delta).toFixed(0)}% vs last month`}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Insights ──────────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <section className="animate-slide-up stagger-2">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Monthly Insights</h2>
          <div className="flex flex-col gap-2">
            {insights.map((insight) => {
              const c = INSIGHT_COLORS[insight.type]
              return (
                <div key={insight.id}
                  className={`flex items-start gap-3 rounded-2xl px-4 py-3 ${c.text}`}
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
                  <p className="text-sm">{insight.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Charts ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up stagger-3">
        <CategoryChart data={categoryData} />
        <MonthlyChart data={monthlyChartData} />
      </div>

    </div>
  )
}
