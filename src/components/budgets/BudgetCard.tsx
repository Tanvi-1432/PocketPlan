import type { BudgetProgress } from '../../types'
import { CATEGORY_COLORS } from '../../constants'
import { formatCurrency } from '../../utils'
import { ProgressBar, Button } from '../ui'

interface BudgetCardProps {
  item: BudgetProgress
  onEdit: () => void
  onDelete: () => void
}

export default function BudgetCard({ item, onEdit, onDelete }: BudgetCardProps) {
  const { budget, spent, remaining, isOverBudget, percentUsed } = item
  const color = CATEGORY_COLORS[budget.category]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold text-gray-900">{budget.category}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Edit budget">
            ✎
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="hover:text-red-600 hover:bg-red-50"
            aria-label="Delete budget"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar percent={percentUsed} isOverBudget={isOverBudget} showLabel size="md" />

      {/* Amounts */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-500">
          <span className="font-medium text-gray-800">{formatCurrency(spent)}</span> spent
        </span>
        <span className="text-gray-500">
          limit <span className="font-medium text-gray-800">{formatCurrency(budget.limit)}</span>
        </span>
      </div>

      {/* Status line */}
      <div className={`mt-2 text-xs font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-400'}`}>
        {isOverBudget
          ? `Over budget by ${formatCurrency(spent - budget.limit)}`
          : `${formatCurrency(remaining)} remaining`}
      </div>
    </div>
  )
}
