import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategorySummary } from '../../types'
import { CATEGORY_COLORS } from '../../constants'
import { formatCurrency } from '../../utils'
import Card, { CardHeader, CardBody } from '../ui/Card'

interface CategoryChartProps {
  data: CategorySummary[]
}

interface TooltipPayload {
  name: string
  value: number
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const color = CATEGORY_COLORS[payload[0].name as keyof typeof CATEGORY_COLORS] ?? '#6366f1'
  return (
    <div className="rounded-xl border border-white/10 px-3 py-2.5 text-sm shadow-lg"
      style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <p className="font-semibold text-slate-100 text-xs">{payload[0].name}</p>
      </div>
      <p className="text-slate-300 text-xs tabular">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title="Spending by category" />
        <CardBody className="flex items-center justify-center h-56 text-slate-400 dark:text-slate-500 text-sm">
          No expense data yet
        </CardBody>
      </Card>
    )
  }

  const top = data.slice(0, 6)

  return (
    <Card>
      <CardHeader title="Spending by category" />
      <CardBody>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={top}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={0}
              >
                {top.map((entry) => (
                  <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 w-full space-y-2.5">
            {top.map((entry) => {
              const total = top.reduce((s, e) => s + e.total, 0)
              const pct = total > 0 ? (entry.total / total) * 100 : 0
              const color = CATEGORY_COLORS[entry.category]
              return (
                <div key={entry.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs text-slate-600 dark:text-slate-300">{entry.category}</span>
                    </div>
                    <span className="text-xs font-semibold tabular text-slate-700 dark:text-slate-200">
                      {formatCurrency(entry.total)}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
