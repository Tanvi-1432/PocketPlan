import type { ConnectedAccount } from '../../types'
import { formatCurrency } from '../../utils'

interface AccountCardProps {
  account: ConnectedAccount
}

const INSTITUTION_COLORS: Record<string, string> = {
  Chase:        'bg-blue-600',
  'Capital One':'bg-red-600',
  Fidelity:     'bg-emerald-600',
  Robinhood:    'bg-lime-600',
}

const STATUS_BADGE: Record<ConnectedAccount['status'], { label: string; className: string }> = {
  connected: { label: 'Connected',  className: 'bg-emerald-100 text-emerald-700' },
  syncing:   { label: 'Syncing…',   className: 'bg-amber-100 text-amber-700 animate-pulse' },
  error:     { label: 'Error',      className: 'bg-red-100 text-red-700' },
}

function formatLastSynced(iso: string | null): string {
  if (!iso) return 'Never synced'
  return `Synced ${new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

export default function AccountCard({ account }: AccountCardProps) {
  const { institutionName, accountName, accountType, balance, status, lastSynced } = account
  const badge = STATUS_BADGE[status]
  const avatarColor = INSTITUTION_COLORS[institutionName] ?? 'bg-gray-500'
  const isCredit = accountType === 'Credit Card'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${avatarColor} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
            <span className="text-white text-xs font-bold">
              {institutionName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{institutionName}</p>
            <p className="text-xs text-gray-500">{accountName}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{accountType}</p>
          <p className={`text-xl font-bold ${isCredit && balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {isCredit && balance < 0 ? `-${formatCurrency(Math.abs(balance))}` : formatCurrency(balance)}
          </p>
        </div>
        <p className="text-xs text-gray-400">{formatLastSynced(lastSynced)}</p>
      </div>
    </div>
  )
}
