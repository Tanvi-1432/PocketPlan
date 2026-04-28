import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { MonthlyChartPoint } from '../../types'
import { formatMonth, formatCompactCurrency } from '../../utils'
import Card, { CardHeader, CardBody } from '../ui/Card'

interface MonthlyChartProps {
  data: MonthlyChartPoint[]
}

interface TooltipPayload {
  name: string
  value: number
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length || !label) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm space-y-1">
      <p className="font-medium text-gray-700">{formatMonth(label)}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatCompactCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title="Monthly overview" />
        <CardBody className="flex items-center justify-center h-48 text-gray-400 text-sm">
          No monthly data yet
        </CardBody>
      </Card>
    )
  }

  const formatted = data.map((d) => ({ ...d, month: formatMonth(d.month) }))

  return (
    <Card>
      <CardHeader title="Monthly overview" />
      <CardBody>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={formatted} barCategoryGap="30%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-gray-600 capitalize">{value}</span>
              )}
            />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}
