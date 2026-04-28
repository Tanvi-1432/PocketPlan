import type { InvestmentHolding } from '../../types'
import { formatCurrency } from '../../utils'
import Card, { CardHeader, CardBody } from '../ui/Card'

interface HoldingsTableProps {
  holdings: InvestmentHolding[]
}

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <Card>
        <CardHeader title="Holdings" />
        <CardBody className="text-center text-sm text-gray-400 py-8">No holdings yet</CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="Holdings" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Symbol</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Name</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Qty</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Price</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Value</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Gain/Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {holdings.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-semibold text-gray-900">{h.symbol}</td>
                <td className="px-5 py-3 text-gray-500 hidden sm:table-cell truncate max-w-[180px]">{h.name}</td>
                <td className="px-5 py-3 text-right text-gray-700">{h.quantity}</td>
                <td className="px-5 py-3 text-right text-gray-700">{formatCurrency(h.currentPrice)}</td>
                <td className="px-5 py-3 text-right font-medium text-gray-900">{formatCurrency(h.marketValue)}</td>
                <td className="px-5 py-3 text-right">
                  <span className={h.gainLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {h.gainLoss >= 0 ? '+' : ''}{formatCurrency(h.gainLoss)}
                    <span className="text-xs ml-1">({h.gainLoss >= 0 ? '+' : ''}{h.gainLossPercent.toFixed(2)}%)</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
