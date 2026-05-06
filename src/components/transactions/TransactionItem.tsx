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
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-gray-50 transition-colors group">
      {/* Category dot */}
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          {source === 'synced' && (
            <span className="hidden sm:inline-flex shrink-0 text-[10px] font-medium bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full">
              synced
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {category} · {formatDate(date)}
          {note && <span className="text-gray-400"> · {note}</span>}
        </p>
      </div>

      {/* Amount — right aligned, color-coded */}
      <span className={`text-sm font-semibold shrink-0 tabular-nums ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
        {isIncome ? '+' : '−'}{formatCurrency(amount)}
      </span>

      {/* Actions — visible on hover on desktop, always small on mobile */}
      <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(transaction)}
          aria-label="Edit transaction"
          className="min-w-[32px] min-h-[32px]"
        >
          ✎
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(id)}
          className="hover:text-red-600 hover:bg-red-50 min-w-[32px] min-h-[32px]"
          aria-label="Delete transaction"
        >
          ✕
        </Button>
      </div>
    </div>
  )
}
