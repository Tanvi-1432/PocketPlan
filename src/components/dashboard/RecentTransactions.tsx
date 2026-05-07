import type { Transaction } from '../../types'
import { CATEGORY_COLORS } from '../../constants'
import { formatCurrency, formatDate } from '../../utils'
import Card, { CardHeader, CardBody } from '../ui/Card'

interface RecentTransactionsProps {
  transactions: Transaction[]
  onViewAll: () => void
}

export default function RecentTransactions({ transactions, onViewAll }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader
        title="Recent transactions"
        action={
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            View all →
          </button>
        }
      />
      {transactions.length === 0 ? (
        <CardBody className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
          No transactions yet
        </CardBody>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[t.category] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{t.title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t.category} · {formatDate(t.date)}</p>
              </div>
              <span className={`text-sm font-semibold shrink-0 tabular-nums ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
