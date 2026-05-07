import { useAccountsStore } from '../../store/accounts'
import { useTransactionsStore } from '../../store/transactions'
import { useBudgetsStore } from '../../store/budgets'
import { useInvestmentsStore } from '../../store/investments'
import { buildDemoTransactions, buildDemoBudgets, buildDemoHoldings } from '../../constants/demoData'
import { Button } from '../ui'

export default function SyncButton() {
  const { isSyncing, accounts, syncAccounts } = useAccountsStore()
  const { upsertTransaction } = useTransactionsStore()
  const { setBudget } = useBudgetsStore()
  const { upsertHolding } = useInvestmentsStore()

  async function handleSync() {
    await syncAccounts()

    const now = new Date().toISOString()
    // Upsert — safe to call multiple times, no duplicates
    buildDemoTransactions().forEach((t) => upsertTransaction({ ...t, importedAt: now }))
    buildDemoBudgets().forEach((b) => setBudget(b))
    buildDemoHoldings().forEach((h) => upsertHolding(h))
  }

  return (
    <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
      <svg
        className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M23 4v6h-6M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
      {isSyncing ? 'Syncing…' : accounts.length > 0 ? 'Re-sync Accounts' : 'Simulate Account Sync'}
    </Button>
  )
}
