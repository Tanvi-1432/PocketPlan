interface ProgressBarProps {
  percent: number       // 0–100
  isOverBudget?: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({
  percent,
  isOverBudget = false,
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100)

  const fillColor = isOverBudget
    ? 'bg-red-500'
    : clamped >= 80
    ? 'bg-amber-400'
    : 'bg-indigo-500'

  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${fillColor} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-semibold tabular-nums w-9 text-right shrink-0 ${
          isOverBudget ? 'text-red-600 dark:text-red-400' : clamped >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
        }`}>
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  )
}
