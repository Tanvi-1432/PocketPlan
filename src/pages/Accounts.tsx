import { useMemo } from 'react'
import { useAccountsStore } from '../store/accounts'
import { useTransactionsStore } from '../store/transactions'
import { getNetWorth } from '../utils/investments'
import { formatCurrency } from '../utils'
import AccountCard from '../components/accounts/AccountCard'
import SyncButton from '../components/accounts/SyncButton'

function NetIcon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const NET_WORTH_CARDS = [
  { label: 'Cash',        key: 'cash' as const,          color: 'text-gray-900',    iconColor: 'text-gray-500 bg-gray-100',     icon: <NetIcon d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm0 0V7a2 2 0 012-2h2M16 5H8a2 2 0 00-2 2" /> },
  { label: 'Investments', key: 'investments' as const,    color: 'text-indigo-700',  iconColor: 'text-indigo-600 bg-indigo-50',  icon: <NetIcon d="M3 17l4-8 4 4 4-6 4 3" /> },
  { label: 'Credit Debt', key: 'creditCardDebt' as const, color: 'text-red-600',     iconColor: 'text-red-500 bg-red-50',        icon: <NetIcon d="M1 6h22v13a2 2 0 01-2 2H3a2 2 0 01-2-2V6zm0 5h22" /> },
  { label: 'Net Worth',   key: 'netWorth' as const,       color: 'text-emerald-700', iconColor: 'text-emerald-600 bg-emerald-50', icon: <NetIcon d="M12 20V10M18 20V4M6 20v-4" /> },
]

export default function Accounts() {
  const { accounts, isSyncing } = useAccountsStore()
  const { transactions } = useTransactionsStore()

  const netWorth           = useMemo(() => getNetWorth(accounts), [accounts])
  const checkingAccounts   = useMemo(() => accounts.filter((a) => a.accountType === 'Checking' || a.accountType === 'Savings'), [accounts])
  const creditAccounts     = useMemo(() => accounts.filter((a) => a.accountType === 'Credit Card'), [accounts])
  const investmentAccounts = useMemo(() => accounts.filter((a) => a.accountType === 'Brokerage' || a.accountType === 'Retirement'), [accounts])

  // Count synced transactions per account
  const txCountByAccount = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of transactions) {
      if (t.accountId) {
        map.set(t.accountId, (map.get(t.accountId) ?? 0) + 1)
      }
    }
    return map
  }, [transactions])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connected Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Simulated financial account sync</p>
        </div>
        <SyncButton />
      </div>

      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800">
        <span className="shrink-0">⚠</span>
        <span><strong>Demo Mode:</strong> Simulated data only. No real bank credentials are used.</span>
      </div>

      {accounts.length === 0 && !isSyncing && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm0 0V7a2 2 0 012-2h2M16 5H8a2 2 0 00-2 2" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-700">No accounts connected</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Click "Simulate Account Sync" to load demo bank and investment account data.
          </p>
        </div>
      )}

      {accounts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NET_WORTH_CARDS.map(({ label, key, color, iconColor, icon }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{label}</p>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${iconColor}`}>
                  {icon}
                </div>
              </div>
              <p className={`text-lg font-bold ${color}`}>{formatCurrency(netWorth[key])}</p>
            </div>
          ))}
        </div>
      )}

      {checkingAccounts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bank Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkingAccounts.map((a) => (
              <AccountCard key={a.id} account={a} transactionCount={txCountByAccount.get(a.id) ?? 0} />
            ))}
          </div>
        </section>
      )}

      {creditAccounts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credit Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditAccounts.map((a) => (
              <AccountCard key={a.id} account={a} transactionCount={txCountByAccount.get(a.id) ?? 0} />
            ))}
          </div>
        </section>
      )}

      {investmentAccounts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Investment Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {investmentAccounts.map((a) => (
              <AccountCard key={a.id} account={a} transactionCount={txCountByAccount.get(a.id) ?? 0} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
