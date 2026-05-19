import type { BudgetProgress } from '../../types'
import { CATEGORY_COLORS } from '../../constants'
import { formatCurrency } from '../../utils'
import { ProgressBar, Button } from '../ui'

/**
 * Budget progress card.
 *
 * Receives precomputed BudgetProgress so this component only renders the state:
 * percent used, remaining dollars, and over-budget messaging.
 */

interface BudgetCardProps {
  item: BudgetProgress
  onEdit: () => void
  onDelete: () => void
}

export default function BudgetCard({ item, onEdit, onDelete }: BudgetCardProps) {
  const { budget, spent, remaining, isOverBudget, percentUsed } = item
  const color = CATEGORY_COLORS[budget.category]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{budget.category}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Edit budget">✎</Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label="Delete budget">✕</Button>
        </div>
      </div>

      <ProgressBar percent={percentUsed} isOverBudget={isOverBudget} showLabel size="md" />

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(spent)}</span> spent
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          limit <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(budget.limit)}</span>
        </span>
      </div>

      <div className={`mt-2 text-xs font-medium ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
        {isOverBudget
          ? `Over budget by ${formatCurrency(spent - budget.limit)}`
          : `${formatCurrency(remaining)} remaining`}
      </div>
    </div>
  )
}
