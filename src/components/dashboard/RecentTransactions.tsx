import type { Transaction } from '../../types'
import { CATEGORY_COLORS } from '../../constants'
import { formatCurrency, formatDate } from '../../utils'
import { getMerchantColor, getMerchantInitials } from '../../utils/merchantIcon'
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
            className="text-xs font-medium text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
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
        <div>
          {transactions.map((t, i) => {
            const initials = getMerchantInitials(t.title)
            const color = getMerchantColor(t.title, t.category)
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-violet-50/30 dark:hover:bg-white/3"
                style={i < transactions.length - 1 ? { borderBottom: '1px solid rgba(200,200,230,0.20)' } : {}}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{t.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[t.category] }} />
                    <p className="text-xs text-slate-400 dark:text-slate-500">{t.category} · {formatDate(t.date)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold shrink-0 number-display ${
                  t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                }`}>
                  {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
