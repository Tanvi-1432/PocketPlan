import { useAccountsStore } from '../store/accounts'
import { getNetWorth } from '../utils/investments'
import { formatCurrency } from '../utils'
import AccountCard from '../components/accounts/AccountCard'
import SyncButton from '../components/accounts/SyncButton'

export default function Accounts() {
  const { accounts, isSyncing } = useAccountsStore()
  const netWorth = getNetWorth(accounts)

  const checkingAccounts  = accounts.filter((a) => a.accountType === 'Checking' || a.accountType === 'Savings')
  const creditAccounts    = accounts.filter((a) => a.accountType === 'Credit Card')
  const investmentAccounts = accounts.filter((a) => a.accountType === 'Brokerage' || a.accountType === 'Retirement')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connected Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Simulated financial account sync</p>
        </div>
        <SyncButton />
      </div>

      {/* Demo mode banner */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800">
        <span>⚠</span>
        <span><strong>Demo Mode:</strong> Simulated financial data only. No real bank credentials are used.</span>
      </div>

      {/* Empty state */}
      {accounts.length === 0 && !isSyncing && (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">🏦</p>
          <p className="text-base font-medium text-gray-500">No accounts connected</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Click "Simulate Account Sync" to load demo financial data
          </p>
        </div>
      )}

      {/* Net worth summary */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Cash',         value: netWorth.cash,            color: 'text-gray-900' },
            { label: 'Investments',  value: netWorth.investments,     color: 'text-indigo-700' },
            { label: 'Credit Debt',  value: netWorth.creditCardDebt,  color: 'text-red-600' },
            { label: 'Net Worth',    value: netWorth.netWorth,        color: 'text-emerald-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-lg font-bold ${color}`}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Account groups */}
      {checkingAccounts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bank Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkingAccounts.map((a) => <AccountCard key={a.id} account={a} />)}
          </div>
        </section>
      )}

      {creditAccounts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Credit Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditAccounts.map((a) => <AccountCard key={a.id} account={a} />)}
          </div>
        </section>
      )}

      {investmentAccounts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Investment Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {investmentAccounts.map((a) => <AccountCard key={a.id} account={a} />)}
          </div>
        </section>
      )}
    </div>
  )
}
