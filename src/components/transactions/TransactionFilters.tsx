import type { TransactionType, Category } from '../../types'
import { ALL_CATEGORIES } from '../../constants'
import { Select } from '../ui'
import type { SelectOption } from '../ui'

/**
 * Filter controls for TransactionList.
 *
 * This component is intentionally controlled: parent/list state owns the filter
 * object, and each select emits a shallowly patched copy.
 */

export interface TransactionFilters {
  month: string
  type: TransactionType | 'all'
  category: Category | 'all'
}

interface TransactionFiltersProps {
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
  availableMonths: string[]
}

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All categories' },
  ...ALL_CATEGORIES.map((c) => ({ value: c, label: c })),
]

function monthOptions(months: string[]): SelectOption[] {
  if (months.length === 0) return [{ value: 'all', label: 'All months' }]
  return [
    { value: 'all', label: 'All months' },
    ...months.map((m) => {
      // Month values stay as YYYY-MM keys for filtering, while labels are
      // formatted for people.
      const [year, month] = m.split('-')
      const label = new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
      return { value: m, label }
    }),
  ]
}

export default function TransactionFilters({
  filters,
  onChange,
  availableMonths,
}: TransactionFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 min-w-0">
      <Select
        options={monthOptions(availableMonths)}
        value={filters.month}
        onChange={(e) => onChange({ ...filters, month: e.target.value })}
        aria-label="Filter by month"
      />
      <Select
        options={TYPE_OPTIONS}
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value as TransactionFilters['type'] })}
        aria-label="Filter by type"
      />
      <Select
        options={CATEGORY_OPTIONS}
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value as TransactionFilters['category'] })}
        aria-label="Filter by category"
      />
    </div>
  )
}
