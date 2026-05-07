import { formatCurrency } from '../../utils'

interface SummaryCardProps {
  label: string
  amount: number
  variant: 'income' | 'expense' | 'balance'
}

const VARIANT_STYLES = {
  income: {
    wrapper: '',
    amount: 'text-emerald-600 dark:text-emerald-400',
    label: 'text-slate-500 dark:text-slate-400',
    iconBg: 'rgba(52,211,153,0.14)',
    iconBorder: 'rgba(52,211,153,0.22)',
    iconText: '#059669',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    ),
  },
  expense: {
    wrapper: '',
    amount: 'text-rose-500 dark:text-rose-400',
    label: 'text-slate-500 dark:text-slate-400',
    iconBg: 'rgba(251,113,133,0.14)',
    iconBorder: 'rgba(251,113,133,0.22)',
    iconText: '#e11d48',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    ),
  },
  balance: {
    wrapper: 'balance-card',
    amount: 'text-violet-700 dark:text-violet-300',
    label: 'text-violet-500 dark:text-violet-400',
    iconBg: 'rgba(167,139,250,0.20)',
    iconBorder: 'rgba(167,139,250,0.30)',
    iconText: '#7c3aed',
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
    <div className={`glass-card hover-lift px-3 py-3.5 sm:px-5 sm:py-5 ${s.wrapper}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${s.label}`}>{label}</p>
        <div
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: s.iconBg, border: `1px solid ${s.iconBorder}`, color: s.iconText }}
        >
          {s.icon}
        </div>
      </div>
      <p className={`text-lg sm:text-2xl font-bold number-display truncate ${s.amount}`}>
        {displayAmount}
      </p>
    </div>
  )
}
