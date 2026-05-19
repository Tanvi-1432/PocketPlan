import type { SavingsGoal } from '../../types'
import { formatCurrency, formatDate } from '../../utils'
import { ProgressBar, Button } from '../ui'

/**
 * Goal progress card.
 *
 * Converts a SavingsGoal into progress, deadline status, and contribution UI.
 */

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

type GoalStatus = 'complete' | 'on-track' | 'needs-attention' | 'overdue'

function getStatus(percent: number, days: number, isComplete: boolean): GoalStatus {
  // This intentionally favors encouragement: high progress or a long runway is
  // "on track"; otherwise the card asks for attention.
  if (isComplete) return 'complete'
  if (days < 0) return 'overdue'
  if (percent >= 70 || days > 60) return 'on-track'
  return 'needs-attention'
}

const STATUS_STYLES: Record<GoalStatus, { label: string; className: string }> = {
  'complete':         { label: 'Complete',        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' },
  'on-track':         { label: 'On track',        className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'   },
  'needs-attention':  { label: 'Needs attention', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'       },
  'overdue':          { label: 'Overdue',         className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'               },
}

export default function GoalCard({ goal, onEdit, onDelete, onContribute }: GoalCardProps) {
  const { name, targetAmount, currentAmount, deadline } = goal
  // Clamp visual progress at 100%; the store also clamps contributions, but the
  // UI remains defensive for imported or edited data.
  const percent = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0
  const isComplete = currentAmount >= targetAmount
  const days = daysRemaining(deadline)
  const isOverdue = days < 0 && !isComplete
  const status = getStatus(percent, days, isComplete)
  const { label: statusLabel, className: statusClass } = STATUS_STYLES[status]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{name}</h3>
            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
          <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
            {isOverdue
              ? `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
              : isComplete
              ? `Reached on ${formatDate(deadline)}`
              : `${days} day${days !== 1 ? 's' : ''} remaining · due ${formatDate(deadline)}`}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Edit goal">✎</Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label="Delete goal">✕</Button>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{formatCurrency(currentAmount)}</span> saved
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
            {Math.round(percent)}%
          </span>
        </div>
        <ProgressBar percent={percent} size="lg" />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-slate-400 dark:text-slate-500">$0</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            goal: <span className="font-medium text-slate-600 dark:text-slate-300">{formatCurrency(targetAmount)}</span>
          </span>
        </div>
      </div>

      {/* Contribute */}
      {!isComplete && (
        <Button variant="secondary" size="sm" onClick={onContribute} className="w-full justify-center">
          + Add contribution
        </Button>
      )}
    </div>
  )
}
