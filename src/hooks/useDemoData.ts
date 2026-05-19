import { useTransactionsStore } from '../store/transactions'
import { useBudgetsStore } from '../store/budgets'
import { useGoalsStore } from '../store/goals'
import { useAccountsStore } from '../store/accounts'
import { useInvestmentsStore } from '../store/investments'
import {
  buildDemoTransactions,
  buildDemoBudgets,
  buildDemoGoals,
  buildDemoAccounts,
  buildDemoHoldings,
} from '../constants/demoData'

/**
 * Coordinates demo data across all persisted stores.
 *
 * The builders live in `constants/demoData.ts`, while this hook owns when that
 * generated data is written into Zustand. Keeping orchestration here lets pages
 * load/reset the full experience with one call.
 */
export function useDemoData() {
  const { transactions, upsertTransaction } = useTransactionsStore()
  const { budgets, setBudget } = useBudgetsStore()
  const { goals, upsertGoal } = useGoalsStore()
  const { accounts, clearConnectedAccounts } = useAccountsStore()
  const { holdings, upsertHolding, clearHoldings } = useInvestmentsStore()

  const hasData =
    transactions.length > 0 ||
    budgets.length > 0 ||
    goals.length > 0 ||
    accounts.length > 0 ||
    holdings.length > 0

  // Fully idempotent: each domain uses stable IDs or upsert semantics, so this
  // can be called from Dashboard and Settings without duplicating demo rows.
  function loadDemoData() {
    const now = new Date().toISOString()

    // Transactions are marked as imported now so synced badges/timestamps feel
    // fresh even though the generated month history is deterministic by ID.
    buildDemoTransactions().forEach((t) => upsertTransaction({ ...t, importedAt: now }))

    // Budgets upsert by category+month, which keeps one monthly limit per
    // category even if the user clicks "Load demo" repeatedly.
    buildDemoBudgets().forEach((b) => setBudget(b))

    // Goals/holdings use stable IDs so the stores can replace existing demo
    // entities instead of appending duplicates.
    buildDemoGoals().forEach((g) => upsertGoal(g))

    // Accounts are replaced as a batch because the demo account set should stay
    // internally consistent with transaction accountId foreign keys.
    const { setAccounts } = useAccountsStore.getState()
    setAccounts(buildDemoAccounts(now))

    buildDemoHoldings().forEach((h) => upsertHolding(h))
  }

  // Clears each persisted domain through its public delete API and resets
  // onboarding so the welcome card can teach the first-run flow again.
  function clearDemoData() {
    useTransactionsStore.getState().transactions
      .forEach((t) => useTransactionsStore.getState().deleteTransaction(t.id))

    useBudgetsStore.getState().budgets
      .forEach((b) => useBudgetsStore.getState().deleteBudget(b.id))

    useGoalsStore.getState().goals
      .forEach((g) => useGoalsStore.getState().deleteGoal(g.id))

    clearConnectedAccounts()
    clearHoldings()
    localStorage.removeItem('pocketplan-onboarding-dismissed')
  }

  // Nuclear clear for development/testing. This intentionally removes
  // user-created local records as well as demo records.
  function clearAllData() {
    useTransactionsStore.getState().transactions
      .forEach((t) => useTransactionsStore.getState().deleteTransaction(t.id))
    useBudgetsStore.getState().budgets
      .forEach((b) => useBudgetsStore.getState().deleteBudget(b.id))
    useGoalsStore.getState().goals
      .forEach((g) => useGoalsStore.getState().deleteGoal(g.id))
    clearConnectedAccounts()
    clearHoldings()
  }

  return { hasData, loadDemoData, clearDemoData, clearAllData }
}
