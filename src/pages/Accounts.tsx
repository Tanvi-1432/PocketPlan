import { useMemo } from 'react'
import { useAccountsStore } from '../store/accounts'
import { getNetWorth } from '../utils/investments'
import { formatCurrency } from '../utils'
import AccountCard from '../components/accounts/AccountCard'
import SyncButton from '../components/accounts/SyncButton'

export default function Accounts() {
  const { accounts, isSyncing } = useAccountsStore()

  const netWorth           = useMemo(() => getNetWorth(accounts), [accounts])
  const checkingAccounts   = useMemo(() => accounts.filter((a) => a.accountType === 'Checking' || a.accountType === 'Savings'), [accounts])
  const creditAccounts     = useMemo(() => accounts.filter((a) => a.accountType === 'Credit Card'), [accounts])
  const investmentAccounts = useMemo(() => accounts.filter((a) => a.accountType === 'Brokerage' || a.accountType === 'Retirement'), [accounts])

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
            Click "Simulate Account Sync" to load demo bank and investment account data
          </p>
        </div>
      )}

      {accounts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Cash',        value: netWorth.cash,           color: 'text-gray-900' },
            { label: 'Investments', value: netWorth.investments,    color: 'text-indigo-700' },
            { label: 'Credit Debt', value: netWorth.creditCardDebt, color: 'text-red-600' },
            { label: 'Net Worth',   value: netWorth.netWorth,       color: 'text-emerald-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-lg font-bold ${color}`}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      )}

      {checkingAccounts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bank Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkingAccounts.map((a) => <AccountCard key={a.id} account={a} />)}
          </div>
        </section>
      )}

      {creditAccounts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credit Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditAccounts.map((a) => <AccountCard key={a.id} account={a} />)}
          </div>
        </section>
      )}

      {investmentAccounts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Investment Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {investmentAccounts.map((a) => <AccountCard key={a.id} account={a} />)}
          </div>
        </section>
      )}
    </div>
  )
}
