import { useTransactionsStore } from '../store/transactions'
import { useBudgetsStore } from '../store/budgets'
import { useGoalsStore } from '../store/goals'
import { useAccountsStore } from '../store/accounts'
import { useInvestmentsStore } from '../store/investments'
import {
  buildManualDemoTransactions,
  buildManualDemoGoals,
  buildDemoBudgets,
} from '../constants/demoData'

export function useDemoData() {
  const { transactions, addTransaction, deleteTransaction } = useTransactionsStore()
  const { setBudget, budgets, deleteBudget } = useBudgetsStore()
  const { goals, addGoal, deleteGoal, updateGoal } = useGoalsStore()
  const { clearConnectedAccounts } = useAccountsStore()
  const { clearHoldings } = useInvestmentsStore()

  const hasData =
    transactions.length > 0 || budgets.length > 0 || goals.length > 0

  function loadDemoData() {
    buildManualDemoTransactions().forEach((t) => addTransaction(t))
    buildDemoBudgets().forEach((b) => setBudget(b))
    buildManualDemoGoals().forEach((g) => {
      // addGoal starts currentAmount at 0, so we add then patch currentAmount
      addGoal({ name: g.name, targetAmount: g.targetAmount, deadline: g.deadline })
    })
    // Patch currentAmounts after adding (goals are appended, grab last N)
    const freshGoals = useGoalsStore.getState().goals
    const demoGoalData = buildManualDemoGoals()
    const added = freshGoals.slice(-demoGoalData.length)
    added.forEach((g, i) => {
      updateGoal(g.id, { currentAmount: demoGoalData[i].currentAmount })
    })
  }

  function clearAllData() {
    ;[...transactions].forEach((t) => deleteTransaction(t.id))
    ;[...budgets].forEach((b) => deleteBudget(b.id))
    ;[...goals].forEach((g) => deleteGoal(g.id))
    clearConnectedAccounts()
    clearHoldings()
  }

  return { hasData, loadDemoData, clearAllData }
}
