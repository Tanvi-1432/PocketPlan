import type { ConnectedAccount } from '../../types'
import { formatCurrency } from '../../utils'

interface AccountCardProps {
  account: ConnectedAccount
  transactionCount?: number
}

const INSTITUTION_COLORS: Record<string, string> = {
  Chase:        'bg-blue-600',
  'Capital One':'bg-red-600',
  Fidelity:     'bg-emerald-600',
  Robinhood:    'bg-lime-600',
}

const STATUS_BADGE: Record<ConnectedAccount['status'], { label: string; className: string }> = {
  connected: { label: 'Connected', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  syncing:   { label: 'Syncing…',  className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 animate-pulse' },
  error:     { label: 'Error',     className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
}

function formatLastSynced(iso: string | null): string {
  if (!iso) return 'Never synced'
  return `Synced ${new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

export default function AccountCard({ account, transactionCount }: AccountCardProps) {
  const { institutionName, accountName, accountType, balance, status, lastSynced } = account
  const badge = STATUS_BADGE[status]
  const avatarColor = INSTITUTION_COLORS[institutionName] ?? 'bg-slate-500'
  const isDebt = accountType === 'Credit Card' || accountType === 'Loan' || accountType === 'Debt'

  return (
    <div className="glass-card hover-lift p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${avatarColor} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
            <span className="text-white text-xs font-bold">
              {institutionName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{institutionName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{accountName}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{accountType}</p>
          <p className={`text-xl font-bold number-display ${isDebt && balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {isDebt && balance < 0 ? `-${formatCurrency(Math.abs(balance))}` : formatCurrency(balance)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-slate-500">{formatLastSynced(lastSynced)}</p>
          {transactionCount !== undefined && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
