import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
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
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-slate-900 dark:text-slate-100">{payload[0].name}</p>
      <p className="text-slate-600 dark:text-slate-300 mt-0.5">{formatCurrency(payload[0].value)}</p>
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

  return (
    <Card>
      <CardHeader title="Spending by category" />
      <CardBody>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
              formatter={(value) => (
                <span style={{ color: 'inherit' }} className="text-slate-600 dark:text-slate-400">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}
