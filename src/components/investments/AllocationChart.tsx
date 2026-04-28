import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ChartDataPoint } from '../../types'
import { formatCurrency } from '../../utils'
import Card, { CardHeader, CardBody } from '../ui/Card'

const COLORS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#14b8a6','#f97316']

interface AllocationChartProps {
  data: ChartDataPoint[]
  totalValue: number
}

interface TooltipPayload { name: string; value: number }

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-medium text-gray-900">{payload[0].name}</p>
      <p className="text-gray-600">{payload[0].value}%</p>
    </div>
  )
}

export default function AllocationChart({ data, totalValue }: AllocationChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title="Portfolio allocation" />
        <CardBody className="flex items-center justify-center h-48 text-gray-400 text-sm">
          No holdings yet
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="Portfolio allocation" subtitle={`Total: ${formatCurrency(totalValue)}`} />
      <CardBody>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}
