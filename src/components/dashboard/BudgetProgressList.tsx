import type { BudgetProgress } from '../../types'
import { formatCurrency } from '../../utils'
import { ProgressBar } from '../ui'
import Card, { CardHeader, CardBody } from '../ui/Card'

interface BudgetProgressListProps {
  items: BudgetProgress[]
  onViewAll: () => void
}

export default function BudgetProgressList({ items, onViewAll }: BudgetProgressListProps) {
  const preview = items.slice(0, 4)

  return (
    <Card>
      <CardHeader
        title="Budget progress"
        action={
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            Manage →
          </button>
        }
      />
      {preview.length === 0 ? (
        <CardBody className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
          No budgets set for this month
        </CardBody>
      ) : (
        <CardBody className="flex flex-col gap-4">
          {preview.map(({ budget, spent, remaining, isOverBudget, percentUsed }) => (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{budget.category}</span>
                <span className={`text-xs font-medium ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                </span>
              </div>
              <ProgressBar percent={percentUsed} isOverBudget={isOverBudget} showLabel />
              <p className={`text-xs mt-1 ${isOverBudget ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {isOverBudget
                  ? `Over by ${formatCurrency(spent - budget.limit)}`
                  : `${formatCurrency(remaining)} remaining`}
              </p>
            </div>
          ))}
        </CardBody>
      )}
    </Card>
  )
}
