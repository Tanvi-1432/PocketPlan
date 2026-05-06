import { useState, useMemo } from 'react'
import type { Budget } from '../types'
import { useTransactionsStore } from '../store/transactions'
import { useBudgetsStore } from '../store/budgets'
import { getBudgetProgress } from '../utils/budgets'
import { currentMonthKey, formatMonth } from '../utils'
import { Button, Modal, Select } from '../components/ui'
import type { SelectOption } from '../components/ui'
import BudgetForm from '../components/budgets/BudgetForm'
import BudgetCard from '../components/budgets/BudgetCard'

function buildMonthOptions(budgetMonths: string[], currentMonth: string): SelectOption[] {
  const months = [...new Set([currentMonth, ...budgetMonths])].sort((a, b) => b.localeCompare(a))
  return months.map((m) => ({ value: m, label: formatMonth(m) }))
}

export default function Budgets() {
  const { transactions } = useTransactionsStore()
  const { budgets, setBudget, updateBudget, deleteBudget } = useBudgetsStore()

  const currentMonth = currentMonthKey()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)

  const budgetMonths = useMemo(
    () => [...new Set(budgets.map((b) => b.month))],
    [budgets]
  )

  const monthOptions = useMemo(
    () => buildMonthOptions(budgetMonths, currentMonth),
    [budgetMonths, currentMonth]
  )

  const progressItems = useMemo(
    () => getBudgetProgress(budgets, transactions, selectedMonth),
    [budgets, transactions, selectedMonth]
  )

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(budget: Budget) {
    setEditing(budget)
    setModalOpen(true)
  }

  function handleSubmit(data: Omit<Budget, 'id'>) {
    if (editing) {
      updateBudget(editing.id, data)
    } else {
      setBudget(data)
    }
    setModalOpen(false)
  }

  const overBudgetCount = progressItems.filter((i) => i.isOverBudget).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-sm text-gray-500 mt-0.5">Set monthly spending limits per category</p>
        </div>
        <Button onClick={openAdd}>+ Set budget</Button>
      </div>

      {/* Month picker + alert */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Select
          options={monthOptions}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="sm:w-48"
          aria-label="Select month"
        />
        {overBudgetCount > 0 && (
          <p className="text-sm text-red-600 font-medium">
            ⚠ {overBudgetCount} budget{overBudgetCount !== 1 ? 's' : ''} exceeded this month
          </p>
        )}
      </div>

      {/* Budget grid */}
      {progressItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-700">No budgets for {formatMonth(selectedMonth)}</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs mb-6">
            Set monthly category limits to keep your spending on track.
          </p>
          <Button onClick={openAdd}>Set a budget</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {progressItems.map((item) => (
            <BudgetCard
              key={item.budget.id}
              item={item}
              onEdit={() => openEdit(item.budget)}
              onDelete={() => deleteBudget(item.budget.id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit budget' : 'Set budget'}
      >
        <BudgetForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
