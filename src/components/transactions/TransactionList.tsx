import { useState, useMemo } from "react";
import type { Transaction } from "../../types";
import { toMonthKey } from "../../utils";
import type { TransactionFilters } from "./TransactionFilters";
import TransactionFiltersBar from "./TransactionFilters";
import TransactionItem from "./TransactionItem";

/**
 * Searchable, filterable transaction list.
 *
 * The parent owns CRUD actions. This component owns lightweight list UI state
 * unless persisted search/filter values are passed in.
 */

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onViewDetail: (t: Transaction) => void;
  persistedSearch?: string;
  persistedFilters?: TransactionFilters;
  onSearchChange?: (s: string) => void;
  onFiltersChange?: (f: TransactionFilters) => void;
}

function applyFilters(
  transactions: Transaction[],
  filters: TransactionFilters,
  search: string
): Transaction[] {
  const q = search.toLowerCase().trim();
  return transactions.filter((t) => {
    // Filters short-circuit from cheapest checks to text search. Month uses the
    // same YYYY-MM key as dashboard/budget calculations.
    if (filters.month !== "all" && toMonthKey(t.date) !== filters.month)
      return false;
    if (filters.type !== "all" && t.type !== filters.type) return false;
    if (filters.category !== "all" && t.category !== filters.category)
      return false;
    if (
      q &&
      // Search intentionally covers merchant/title and category, which supports
      // quick queries like "food" without needing a separate filter change.
      !t.title.toLowerCase().includes(q) &&
      !t.category.toLowerCase().includes(q)
    )
      return false;
    return true;
  });
}

const DEFAULT_FILTERS: TransactionFilters = {
  month: "all",
  type: "all",
  category: "all",
};

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onViewDetail,
  persistedSearch = "",
  persistedFilters = DEFAULT_FILTERS,
  onSearchChange,
  onFiltersChange,
}: TransactionListProps) {
  const availableMonths = useMemo(() => {
    // Months are derived from transaction history so the filter never offers an
    // empty month unless "All months" is selected.
    const months = [...new Set(transactions.map((t) => toMonthKey(t.date)))];
    return months.sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const [localSearch, setLocalSearch] = useState(persistedSearch);
  const [localFilters, setLocalFilters] =
    useState<TransactionFilters>(persistedFilters);

  function handleSearchChange(s: string) {
    setLocalSearch(s);
    onSearchChange?.(s);
  }

  function handleFiltersChange(f: TransactionFilters) {
    setLocalFilters(f);
    onFiltersChange?.(f);
  }

  const filtered = useMemo(
    () => applyFilters(transactions, localFilters, localSearch),
    [transactions, localFilters, localSearch]
  );
  const sorted = useMemo(
    // Sorting after filtering keeps the most recent visible result first.
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search transactions…"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-300 dark:focus:border-violet-600 transition-all"
        />
        {localSearch && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <TransactionFiltersBar
        filters={localFilters}
        onChange={handleFiltersChange}
        availableMonths={availableMonths}
      />

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {localSearch
              ? `No results for "${localSearch}"`
              : "No transactions match your filters"}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div
          className="glass-card overflow-hidden divide-y divide-slate-100/70 dark:divide-white/5"
          style={{ borderRadius: "1rem", padding: 0 }}
        >
          {sorted.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      )}

      {sorted.length > 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-right">
          {sorted.length} transaction{sorted.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
