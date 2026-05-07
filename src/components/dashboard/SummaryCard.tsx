import { formatCurrency } from '../../utils'

interface SummaryCardProps {
  label: string
  amount: number
  variant: 'income' | 'expense' | 'balance'
}

const VARIANT_STYLES = {
  income: {
    wrapper: 'bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/6',
    amount: 'text-emerald-600 dark:text-emerald-400',
    label: 'text-slate-500 dark:text-slate-400',
    iconWrapper: 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    ),
  },
  expense: {
    wrapper: 'bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/6',
    amount: 'text-red-500 dark:text-red-400',
    label: 'text-slate-500 dark:text-slate-400',
    iconWrapper: 'bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/15',
    iconText: 'text-red-500 dark:text-red-400',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    ),
  },
  balance: {
    wrapper: 'hero-gradient border-0',
    amount: 'text-white',
    label: 'text-indigo-200',
    iconWrapper: 'bg-white/15 border border-white/20',
    iconText: 'text-white',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3" />
      </svg>
    ),
  },
}

export default function SummaryCard({ label, amount, variant }: SummaryCardProps) {
  const s = VARIANT_STYLES[variant]
  const isNegative = amount < 0
  const displayAmount = isNegative ? `-${formatCurrency(Math.abs(amount))}` : formatCurrency(amount)

  return (
    <div className={`${s.wrapper} rounded-2xl px-3 py-3.5 sm:px-5 sm:py-5 shadow-card hover:shadow-panel transition-all duration-200 hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${s.label}`}>{label}</p>
        <div className={`${s.iconWrapper} ${s.iconText} w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0`}>
          {s.icon}
        </div>
      </div>
      <p className={`text-lg sm:text-2xl font-bold tracking-tight number-display ${s.amount} truncate`}>
        {displayAmount}
      </p>
    </div>
  )
}
