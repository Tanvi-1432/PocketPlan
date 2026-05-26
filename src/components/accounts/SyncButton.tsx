import { useAccountsStore } from '../../store/accounts'
import { useTransactionsStore } from '../../store/transactions'
import { useBudgetsStore } from '../../store/budgets'
import { useInvestmentsStore } from '../../store/investments'
import { buildDemoTransactions, buildDemoBudgets, buildDemoHoldings } from '../../constants/demoData'
import { Button } from '../ui'

/**
 * Simulated account sync button.
 *
 * A real app would call a bank aggregator here. PocketPlan instead syncs demo
 * accounts, transactions, budgets, and holdings so the connected-account flow
 * can be understood without credentials.
 */
export default function SyncButton() {
  const { isSyncing, accounts, syncAccounts } = useAccountsStore()
  const { upsertTransaction } = useTransactionsStore()
  const { setBudget } = useBudgetsStore()
  const { upsertHolding } = useInvestmentsStore()

  async function handleSync() {
    await syncAccounts()

    // Remove synced transactions first so legacy/random imported IDs cannot
    // coexist with the stable demo transaction IDs.
    const { transactions, deleteTransaction } = useTransactionsStore.getState()
    transactions
      .filter((t) => t.source === 'synced')
      .forEach((t) => deleteTransaction(t.id))

    const now = new Date().toISOString()
    // Seed related domains after accounts exist. Transactions reference account
    // IDs; holdings reference brokerage account IDs.
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
      {isSyncing ? 'Syncing…' : accounts.length > 0 ? 'Re-sync Accounts' : 'Connect Accounts'}
    </Button>
  )
}
