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

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length || !label) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm space-y-1">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
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
        <CardBody className="flex items-center justify-center h-56 text-slate-400 dark:text-slate-500 text-sm">
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
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', fillOpacity: 0.04 }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
              formatter={(value) => (
                <span style={{ color: '#94a3b8' }} className="capitalize">{value}</span>
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
