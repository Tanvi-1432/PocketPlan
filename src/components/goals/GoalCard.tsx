import type { SavingsGoal } from '../../types'
import { formatCurrency, formatDate } from '../../utils'
import { ProgressBar, Button } from '../ui'

interface GoalCardProps {
  goal: SavingsGoal
  onEdit: () => void
  onDelete: () => void
  onContribute: () => void
}

function daysRemaining(deadline: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(deadline + 'T00:00:00')
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default function GoalCard({ goal, onEdit, onDelete, onContribute }: GoalCardProps) {
  const { name, targetAmount, currentAmount, deadline } = goal
  const percent = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0
  const isComplete = currentAmount >= targetAmount
  const days = daysRemaining(deadline)
  const isOverdue = days < 0 && !isComplete

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
            {isComplete && (
              <span className="shrink-0 text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Complete
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
            {isOverdue
              ? `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
              : isComplete
              ? `Reached on ${formatDate(deadline)}`
              : `${days} day${days !== 1 ? 's' : ''} remaining · ${formatDate(deadline)}`}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Edit goal">
            ✎
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="hover:text-red-600 hover:bg-red-50"
            aria-label="Delete goal"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div>
        <ProgressBar percent={percent} size="md" />
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>
            <span className="font-medium text-gray-800">{formatCurrency(currentAmount)}</span> saved
          </span>
          <span>
            <span className="font-medium text-gray-800">{formatCurrency(targetAmount)}</span> goal
          </span>
        </div>
      </div>

      {/* Contribute button */}
      {!isComplete && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onContribute}
          className="w-full justify-center"
        >
          + Add contribution
        </Button>
      )}
    </div>
  )
}
