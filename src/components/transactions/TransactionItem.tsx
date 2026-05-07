import type { Transaction } from '../../types'
import { CATEGORY_COLORS } from '../../constants'
import { formatCurrency, formatDate } from '../../utils'
import { Button } from '../ui'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
}

export default function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const { id, title, amount, type, category, date, note, source } = transaction
  const isIncome = type === 'income'
  const color = CATEGORY_COLORS[category]

  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{title}</p>
          {source === 'synced' && (
            <span className="hidden sm:inline-flex shrink-0 text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
              synced
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {category} · {formatDate(date)}
          {note && <span className="text-slate-400 dark:text-slate-500"> · {note}</span>}
        </p>
      </div>

      <span className={`text-sm font-semibold shrink-0 tabular-nums ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
        {isIncome ? '+' : '−'}{formatCurrency(amount)}
      </span>

      <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onEdit(transaction)} aria-label="Edit transaction" className="min-w-[32px] min-h-[32px]">✎</Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(id)} className="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 min-w-[32px] min-h-[32px]" aria-label="Delete transaction">✕</Button>
      </div>
    </div>
  )
}
