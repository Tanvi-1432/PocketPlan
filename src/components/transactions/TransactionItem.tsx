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
  const { id, title, amount, type, category, date, note } = transaction
  const isIncome = type === 'income'
  const color = CATEGORY_COLORS[category]

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
      {/* Category dot */}
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {category} · {formatDate(date)}
          {note && <span className="text-gray-400"> · {note}</span>}
        </p>
      </div>

      {/* Amount */}
      <span className={`text-sm font-semibold shrink-0 ${isIncome ? 'text-emerald-600' : 'text-gray-900'}`}>
        {isIncome ? '+' : '-'}{formatCurrency(amount)}
      </span>

      {/* Actions — visible on hover */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(transaction)}
          aria-label="Edit transaction"
        >
          ✎
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(id)}
          className="hover:text-red-600 hover:bg-red-50"
          aria-label="Delete transaction"
        >
          ✕
        </Button>
      </div>
    </div>
  )
}
