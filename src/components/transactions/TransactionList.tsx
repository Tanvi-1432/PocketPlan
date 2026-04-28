import { useState, useMemo } from 'react'
import type { Transaction } from '../../types'
import { toMonthKey } from '../../utils'
import type { TransactionFilters } from './TransactionFilters'
import TransactionFiltersBar from './TransactionFilters'
import TransactionItem from './TransactionItem'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
}

function applyFilters(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
  return transactions.filter((t) => {
    if (filters.month !== 'all' && toMonthKey(t.date) !== filters.month) return false
    if (filters.type !== 'all' && t.type !== filters.type) return false
    if (filters.category !== 'all' && t.category !== filters.category) return false
    return true
  })
}

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const availableMonths = useMemo(() => {
    const months = [...new Set(transactions.map((t) => toMonthKey(t.date)))]
    return months.sort((a, b) => b.localeCompare(a))
  }, [transactions])

  const [filters, setFilters] = useState<TransactionFilters>({
    month: 'all',
    type: 'all',
    category: 'all',
  })

  const filtered = useMemo(() => applyFilters(transactions, filters), [transactions, filters])
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered]
  )

  return (
    <div className="flex flex-col gap-4">
      <TransactionFiltersBar
        filters={filters}
        onChange={setFilters}
        availableMonths={availableMonths}
      />

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm font-medium text-gray-500">No transactions match your filters</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting the month, type, or category</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {sorted.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {sorted.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {sorted.length} transaction{sorted.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
