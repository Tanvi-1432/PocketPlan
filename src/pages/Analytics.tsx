import { useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useTransactionsStore } from '../store/transactions'
import { useBudgetsStore } from '../store/budgets'
import { useGoalsStore } from '../store/goals'
import {
  getCategoryTrends,
  getSpendingComparisons,
  getSavingsRateTrend,
  getLastNMonthKeys,
  shortMonthLabel,
} from '../utils/trends'
import { computeHealthScore } from '../utils/healthScore'
import { detectSubscriptions, monthlySubscriptionTotal } from '../utils/subscriptions'
import { formatCurrency } from '../utils/currency'
import { currentMonthKey } from '../utils/date'
import { CATEGORY_COLORS } from '../constants'
import type { Category } from '../types'

/**
 * Analytics page.
 *
 * Responsibilities:
 * - Convert transaction history into 6-month chart data.
 * - Explain financial health through weighted score factors.
 * - Detect recurring subscriptions from merchant/date/amount patterns.
 */

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(15,23,42,0.92)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '0.75rem',
    fontSize: '11px',
    color: '#e2e8f0',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
  },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8', fontWeight: 600 },
}

function GradeCircle({ score, grade }: { score: number; grade: string }) {
  const r = 42
  const circ = 2 * Math.PI * r
  // SVG stroke-dasharray turns the score into a circular progress ring.
  const dash = (score / 100) * circ
  const gradeColor =
    grade === 'A' ? '#10b981' :
    grade === 'B' ? '#6366f1' :
    grade === 'C' ? '#f59e0b' :
    grade === 'D' ? '#f97316' : '#ef4444'

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke={gradeColor} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ filter: `drop-shadow(0 0 6px ${gradeColor}60)` }}
        />
        <text x="55" y="50" textAnchor="middle" fontSize="24" fontWeight="700" fill={gradeColor}>{grade}</text>
        <text x="55" y="68" textAnchor="middle" fontSize="12" fill="#94a3b8">{score}/100</text>
      </svg>
    </div>
  )
}

const cardClass = 'glass-card p-6'

export default function Analytics() {
  const { transactions } = useTransactionsStore()
  const { budgets }      = useBudgetsStore()
  const { goals }        = useGoalsStore()

  const monthKey      = currentMonthKey()
  const monthKeys6    = getLastNMonthKeys(6)

  // All analytics below are pure derived values from stores. `useMemo` protects
  // Recharts from receiving fresh array/object identities on unrelated renders.
  const health        = useMemo(() => computeHealthScore(transactions, budgets, goals), [transactions, budgets, goals])
  const comparisons   = useMemo(() => getSpendingComparisons(transactions, monthKey).slice(0, 5), [transactions, monthKey])
  const savingsTrend  = useMemo(() => getSavingsRateTrend(transactions, 6), [transactions])
  const categoryTrend = useMemo(() => getCategoryTrends(transactions, 6), [transactions])
  const subscriptions = useMemo(() => detectSubscriptions(transactions), [transactions])
  const subTotal      = useMemo(() => monthlySubscriptionTotal(subscriptions), [subscriptions])

  const monthlyChartData = useMemo(() =>
    monthKeys6.map((mk) => {
      const found = savingsTrend.find((s) => s.month === mk)
      // Fill missing months with zeroes so chart spacing stays consistent even
      // when the user has partial history.
      return {
        month: shortMonthLabel(mk),
        Income:   found?.totalIncome ?? 0,
        Expenses: found?.totalExpenses ?? 0,
        Savings:  found ? Math.max(0, found.totalIncome - found.totalExpenses) : 0,
      }
    }),
    [monthKeys6, savingsTrend]
  )

  const topCategories = useMemo(() =>
    categoryTrend
      // Pick categories by total 6-month spend to keep the multi-line chart
      // readable instead of plotting every category.
      .map((ct) => ({ cat: ct.category, total: ct.months.reduce((s, m) => s + m.total, 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
      .map((x) => x.cat as Category),
    [categoryTrend]
  )

  const categoryChartData = useMemo(() =>
    monthKeys6.map((mk) => {
      // Recharts expects one row per x-axis label with dynamic category keys.
      const row: Record<string, string | number> = { month: shortMonthLabel(mk) }
      for (const cat of topCategories) {
        const trend = categoryTrend.find((ct) => ct.category === cat)
        const found = trend?.months.find((m) => m.month === mk)
        row[cat] = found?.total ?? 0
      }
      return row
    }),
    [monthKeys6, topCategories, categoryTrend]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Multi-month trends and financial health</p>
      </div>

      {/* ── Financial Health Score ─────────────────────────────────────── */}
      <section className={`${cardClass} animate-scale-in`}>
        <SectionHeader title="Financial Health Score" sub="Composite score based on savings, budgets, emergency fund, and consistency" />
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <GradeCircle score={health.total} grade={health.grade} />
          <div className="flex-1 w-full flex flex-col gap-3">
            {health.factors.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{f.label}</span>
                  <span className="text-xs tabular-nums font-semibold text-slate-500 dark:text-slate-400">{Math.round(f.score)}<span className="font-normal">/100</span></span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${f.score}%`,
                      background: f.score >= 70
                        ? 'linear-gradient(90deg, #6ee7b7, #a7f3d0)'
                        : f.score >= 40
                        ? 'linear-gradient(90deg, #fcd34d, #fde68a)'
                        : 'linear-gradient(90deg, #fca5a5, #fecdd3)',
                    }}
                  />
                </div>
                {f.suggestion && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{f.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Income vs Expenses 6-month ─────────────────────────────────── */}
      <section className={`${cardClass} animate-slide-up stagger-1`}>
        <SectionHeader title="Income vs Expenses — Last 6 Months" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyChartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }} barCategoryGap="32%" barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} {...CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} iconType="circle" iconSize={8} />
            <Bar dataKey="Income"   fill="#6ee7b7" radius={[5, 5, 0, 0]} />
            <Bar dataKey="Expenses" fill="#c4b5fd" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* ── Savings trend ─────────────────────────────────────────────── */}
      <section className={`${cardClass} animate-slide-up stagger-2`}>
        <SectionHeader title="Monthly Savings" sub="Net balance after expenses each month" />
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={monthlyChartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} {...CHART_TOOLTIP_STYLE} />
            <Line
              type="monotone" dataKey="Savings" stroke="#a78bfa" strokeWidth={2.5}
              dot={{ r: 4, fill: '#a78bfa', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#a78bfa', strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* ── Category trends ───────────────────────────────────────────── */}
      {categoryChartData.length > 0 && topCategories.length > 0 && (
        <section className={`${cardClass} animate-slide-up stagger-3`}>
          <SectionHeader title="Spending by Category — Last 6 Months" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={categoryChartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} {...CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} iconType="circle" iconSize={8} />
              {topCategories.map((cat) => (
                <Line
                  key={cat} type="monotone" dataKey={cat} stroke={CATEGORY_COLORS[cat]} strokeWidth={2}
                  dot={{ r: 3, fill: CATEGORY_COLORS[cat], strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* ── Month-over-month comparison ───────────────────────────────── */}
      {comparisons.length > 0 && (
        <section className={`${cardClass} animate-slide-up stagger-4`}>
          <SectionHeader title="Month-over-Month Changes" sub="Compared to last month by category" />
          <div className="flex flex-col gap-0 divide-y divide-slate-100/80 dark:divide-white/4">
            {comparisons.map((c) => {
              const up = c.delta > 0
              const neutral = Math.abs(c.delta) < 1
              return (
                <div key={c.category} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.category] }} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.category}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-xs text-slate-400 dark:text-slate-500 number-display">{formatCurrency(c.thisMonth)}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      neutral ? 'bg-slate-100 dark:bg-white/6 text-slate-500 dark:text-slate-400' :
                      up ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' :
                           'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {neutral ? '—' : `${up ? '+' : ''}${c.delta.toFixed(0)}%`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Subscriptions ─────────────────────────────────────────────── */}
      <section className={`${cardClass} animate-slide-up stagger-4`}>
        <div className="flex items-start justify-between mb-5">
          <SectionHeader title="Detected Subscriptions" sub="Recurring charges detected from transaction history" />
          {subscriptions.length > 0 && (
            <div className="text-right shrink-0 -mt-1">
              <p className="text-xs text-slate-400 dark:text-slate-500">Monthly total</p>
              <p className="text-xl font-bold number-display text-slate-800 dark:text-slate-200">{formatCurrency(subTotal)}</p>
            </div>
          )}
        </div>
        {subscriptions.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No recurring subscriptions detected yet. Add more transactions to enable detection.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100/80 dark:divide-white/4">
            {subscriptions.slice(0, 8).map((s) => (
              <div key={s.seriesKey} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400 shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.12))' }}>
                    {s.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.title}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{s.frequency} · {s.occurrences}× detected</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold number-display text-slate-700 dark:text-slate-300">{formatCurrency(s.amount)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{s.frequency}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
