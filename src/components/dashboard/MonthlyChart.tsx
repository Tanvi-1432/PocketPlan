import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
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
    <div className="rounded-xl border border-white/10 px-3 py-2.5 text-sm shadow-lg"
      style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)' }}>
      <p className="font-semibold text-slate-200 text-xs mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-slate-200 font-medium tabular">{formatCompactCurrency(p.value)}</span>
        </div>
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
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={formatted} barCategoryGap="32%" barGap={3} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
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
            <Bar dataKey="income" name="Income" fill="#6ee7b7" radius={[5, 5, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#c4b5fd" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: '#6ee7b7' }} />
            <span className="text-xs text-slate-400 dark:text-slate-500">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: '#c4b5fd' }} />
            <span className="text-xs text-slate-400 dark:text-slate-500">Expenses</span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
