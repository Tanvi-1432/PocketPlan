import { formatCurrency } from '../../utils'

interface SummaryCardProps {
  label: string
  amount: number
  variant: 'income' | 'expense' | 'balance'
}

const VARIANT_STYLES = {
  income: {
    accent: '#34d399',
    amountColor: 'text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    ),
  },
  expense: {
    accent: '#f87171',
    amountColor: 'text-rose-500 dark:text-rose-400',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    ),
  },
  balance: {
    accent: '#a78bfa',
    amountColor: 'text-violet-600 dark:text-violet-300',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
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
    <div className="card px-3 py-3.5 sm:px-5 sm:py-5">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${s.accent}18` }}>
          {s.icon}
        </div>
      </div>
      <p className={`text-lg sm:text-2xl font-bold tracking-tight number-display truncate ${s.amountColor}`}>
        {displayAmount}
      </p>
    </div>
  )
}
