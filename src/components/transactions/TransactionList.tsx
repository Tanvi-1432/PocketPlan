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

function applyFilters(transactions: Transaction[], filters: TransactionFilters, search: string): Transaction[] {
  const q = search.toLowerCase().trim()
  return transactions.filter((t) => {
    if (filters.month !== 'all' && toMonthKey(t.date) !== filters.month) return false
    if (filters.type !== 'all' && t.type !== filters.type) return false
    if (filters.category !== 'all' && t.category !== filters.category) return false
    if (q && !t.title.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false
    return true
  })
}

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const availableMonths = useMemo(() => {
    const months = [...new Set(transactions.map((t) => toMonthKey(t.date)))]
    return months.sort((a, b) => b.localeCompare(a))
  }, [transactions])

  const [filters, setFilters] = useState<TransactionFilters>({ month: 'all', type: 'all', category: 'all' })
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => applyFilters(transactions, filters, search), [transactions, filters, search])
  const sorted = useMemo(() => [...filtered].sort((a, b) => b.date.localeCompare(a.date)), [filtered])

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search transactions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" aria-label="Clear search">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <TransactionFiltersBar filters={filters} onChange={setFilters} availableMonths={availableMonths} />

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {search ? `No results for "${search}"` : 'No transactions match your filters'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {sorted.map((t) => (
            <TransactionItem key={t.id} transaction={t} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}

      {sorted.length > 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-right">
          {sorted.length} transaction{sorted.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
