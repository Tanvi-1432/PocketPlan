import { useAccountsStore } from '../../store/accounts'
import { useTransactionsStore } from '../../store/transactions'
import { useBudgetsStore } from '../../store/budgets'
import { useInvestmentsStore } from '../../store/investments'
import { buildDemoTransactions, buildDemoBudgets } from '../../constants/demoData'
import { Button } from '../ui'

export default function SyncButton() {
  const { isSyncing, accounts, syncAccounts, clearConnectedAccounts } = useAccountsStore()
  const { transactions, addTransaction, deleteTransaction } = useTransactionsStore()
  const { setBudget } = useBudgetsStore()
  const { loadDemoHoldings, clearHoldings } = useInvestmentsStore()

  async function handleSync() {
    await syncAccounts()

    // Load demo transactions if none synced yet
    const hasSynced = transactions.some((t) => t.source === 'synced')
    if (!hasSynced) {
      buildDemoTransactions().forEach((t) => addTransaction(t))
    }

    // Load demo budgets
    buildDemoBudgets().forEach((b) => setBudget(b))

    // Load demo holdings
    loadDemoHoldings()
  }

  function handleClear() {
    clearConnectedAccounts()
    clearHoldings()
    // Remove synced transactions only
    transactions
      .filter((t) => t.source === 'synced')
      .forEach((t) => deleteTransaction(t.id))
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleSync} disabled={isSyncing}>
        {isSyncing ? '⟳ Syncing…' : '⟳ Simulate Account Sync'}
      </Button>
      {accounts.length > 0 && (
        <Button variant="secondary" onClick={handleClear} disabled={isSyncing}>
          Clear Demo Data
        </Button>
      )}
    </div>
  )
}
