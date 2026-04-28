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
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-medium text-gray-900">{payload[0].name}</p>
      <p className="text-gray-600">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title="Spending by category" />
        <CardBody className="flex items-center justify-center h-48 text-gray-400 text-sm">
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
              innerRadius={60}
              outerRadius={95}
              paddingAngle={2}
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
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}
