import { formatCurrency } from '../../utils'

interface SummaryCardProps {
  label: string
  amount: number
  variant: 'income' | 'expense' | 'balance'
}

const VARIANT_STYLES = {
  income: {
    bg: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
    amount: 'text-emerald-600 dark:text-emerald-400',
    label: 'text-slate-500 dark:text-slate-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    ),
  },
  expense: {
    bg: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
    amount: 'text-red-600 dark:text-red-400',
    label: 'text-slate-500 dark:text-slate-400',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
    iconText: 'text-red-600 dark:text-red-400',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    ),
  },
  balance: {
    bg: 'bg-indigo-600 border border-indigo-600',
    amount: 'text-white',
    label: 'text-indigo-200',
    iconBg: 'bg-indigo-500',
    iconText: 'text-white',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
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
    <div className={`${s.bg} rounded-xl px-3 py-3 sm:px-5 sm:py-5 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${s.label}`}>{label}</p>
        <div className={`${s.iconBg} ${s.iconText} w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center`}>
          {s.icon}
        </div>
      </div>
      <p className={`text-lg sm:text-2xl font-bold tracking-tight ${s.amount} truncate`}>{displayAmount}</p>
    </div>
  )
}
