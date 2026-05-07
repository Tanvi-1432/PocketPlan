import { useTransactionsStore } from '../store/transactions'
import { useBudgetsStore } from '../store/budgets'
import { useGoalsStore } from '../store/goals'
import { useAccountsStore } from '../store/accounts'
import { useInvestmentsStore } from '../store/investments'
import {
  buildManualDemoTransactions,
  buildDemoTransactions,
  buildDemoBudgets,
  buildDemoGoals,
  buildDemoAccounts,
  buildDemoHoldings,
} from '../constants/demoData'

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

  // Fully idempotent — safe to call multiple times, in any order
  function loadDemoData() {
    const now = new Date().toISOString()

    // Transactions (manual + synced) — upsert by stable id
    buildManualDemoTransactions().forEach((t) => upsertTransaction(t))
    buildDemoTransactions().forEach((t) => upsertTransaction({ ...t, importedAt: now }))

    // Budgets — setBudget is already an upsert by category+month
    buildDemoBudgets().forEach((b) => setBudget(b))

    // Goals — upsert by stable id
    buildDemoGoals().forEach((g) => upsertGoal(g))

    // Accounts — set as a batch (replaces existing demo accounts)
    const { setAccounts } = useAccountsStore.getState()
    setAccounts(buildDemoAccounts(now))

    // Holdings — upsert by stable id
    buildDemoHoldings().forEach((h) => upsertHolding(h))
  }

  // Removes only demo-prefixed entities — reads live state to avoid stale closures
  function clearDemoData() {
    useTransactionsStore.getState().transactions
      .filter((t) => t.id.startsWith('demo-'))
      .forEach((t) => useTransactionsStore.getState().deleteTransaction(t.id))

    useBudgetsStore.getState().budgets
      .filter((b) => b.id.startsWith('demo-'))
      .forEach((b) => useBudgetsStore.getState().deleteBudget(b.id))

    useGoalsStore.getState().goals
      .filter((g) => g.id.startsWith('demo-'))
      .forEach((g) => useGoalsStore.getState().deleteGoal(g.id))

    clearConnectedAccounts()
    clearHoldings()
  }

  // Nuclear clear — removes everything including user-created data
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
