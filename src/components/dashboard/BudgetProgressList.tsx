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
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Manage →
          </button>
        }
      />
      {preview.length === 0 ? (
        <CardBody className="text-center text-sm text-gray-400 py-8">
          No budgets set for this month
        </CardBody>
      ) : (
        <CardBody className="flex flex-col gap-4">
          {preview.map(({ budget, spent, remaining, isOverBudget, percentUsed }) => (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                <span className={`text-xs font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
                  {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                </span>
              </div>
              <ProgressBar percent={percentUsed} isOverBudget={isOverBudget} showLabel />
              {isOverBudget && (
                <p className="text-xs text-red-500 mt-1">
                  Over by {formatCurrency(spent - budget.limit)}
                </p>
              )}
              {!isOverBudget && (
                <p className="text-xs text-gray-400 mt-1">
                  {formatCurrency(remaining)} remaining
                </p>
              )}
            </div>
          ))}
        </CardBody>
      )}
    </Card>
  )
}
