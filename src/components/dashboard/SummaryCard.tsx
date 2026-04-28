import { formatCurrency } from '../../utils'

interface SummaryCardProps {
  label: string
  amount: number
  variant: 'income' | 'expense' | 'balance'
}

const VARIANT_STYLES = {
  income:  { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'text-emerald-600', icon: '↑' },
  expense: { bg: 'bg-red-50',     text: 'text-red-700',     label: 'text-red-600',     icon: '↓' },
  balance: { bg: 'bg-indigo-50',  text: 'text-indigo-700',  label: 'text-indigo-600',  icon: '◈' },
}

export default function SummaryCard({ label, amount, variant }: SummaryCardProps) {
  const s = VARIANT_STYLES[variant]
  const displayAmount = variant === 'balance' && amount < 0
    ? `-${formatCurrency(Math.abs(amount))}`
    : formatCurrency(amount)

  return (
    <div className={`${s.bg} rounded-xl px-5 py-4 flex items-center gap-4`}>
      <span className={`text-2xl ${s.text}`}>{s.icon}</span>
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${s.label}`}>{label}</p>
        <p className={`text-xl font-bold mt-0.5 ${s.text}`}>{displayAmount}</p>
      </div>
    </div>
  )
}
