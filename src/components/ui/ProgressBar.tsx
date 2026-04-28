interface ProgressBarProps {
  percent: number       // 0–100
  isOverBudget?: boolean
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export default function ProgressBar({
  percent,
  isOverBudget = false,
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100)

  const trackColor = 'bg-gray-100'
  const fillColor = isOverBudget
    ? 'bg-red-500'
    : clamped >= 80
    ? 'bg-amber-400'
    : 'bg-indigo-500'

  const height = size === 'sm' ? 'h-1.5' : 'h-2.5'

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 ${trackColor} rounded-full overflow-hidden ${height}`}>
        <div
          className={`${fillColor} ${height} rounded-full transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium w-10 text-right ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
          {Math.round(percent)}%
        </span>
      )}
    </div>
  )
}
