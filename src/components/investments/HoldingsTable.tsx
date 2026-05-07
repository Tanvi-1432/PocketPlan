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
        <CardBody className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">No holdings yet</CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="Holdings" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Symbol</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell">Name</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-right">Qty</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-right">Price</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-right">Value</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-right">Gain / Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {holdings.map((h) => {
              const isPositive = h.gainLoss >= 0
              const gainClass = isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
              return (
                <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{h.symbol}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell truncate max-w-[160px]">{h.name}</td>
                  <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300 tabular-nums">{h.quantity}</td>
                  <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300 tabular-nums">{formatCurrency(h.currentPrice)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{formatCurrency(h.marketValue)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    <div className={`flex flex-col items-end ${gainClass}`}>
                      <span className="font-semibold">{isPositive ? '+' : ''}{formatCurrency(h.gainLoss)}</span>
                      <span className="text-xs opacity-80">{isPositive ? '+' : ''}{h.gainLossPercent.toFixed(2)}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
