import type { Transaction } from "../../types";
import { formatCurrency, formatDate } from "../../utils";
import { Button, MerchantAvatar } from "../ui";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onViewDetail: (t: Transaction) => void;
}

function EditIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  onViewDetail,
}: TransactionItemProps) {
  const { id, title, amount, type, category, date, source, isRecurring, autoCategorized, categoryOverridden } = transaction;
  const isIncome = type === "income";

  return (
    <div
      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
      onClick={() => onViewDetail(transaction)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onViewDetail(transaction);
      }}
      aria-label={`View details for ${title}`}
    >
      <MerchantAvatar title={title} category={category} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            {title}
          </p>
          {source === "synced" && (
            <span className="hidden sm:inline-flex shrink-0 text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
              synced
            </span>
          )}
          {isRecurring && (
            <span className="hidden sm:inline-flex shrink-0 text-[10px] font-medium bg-violet-50 dark:bg-violet-950/50 text-violet-500 dark:text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-100 dark:border-violet-900">
              ↻ recurring
            </span>
          )}
          {autoCategorized && !categoryOverridden && (
            <span className="hidden sm:inline-flex shrink-0 text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-500 dark:text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-100 dark:border-amber-900">
              auto
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {category} · {formatDate(date)}
        </p>
      </div>

      <span
        className={`text-sm font-semibold shrink-0 tabular-nums ${
          isIncome
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-500 dark:text-red-400"
        }`}
      >
        {isIncome ? "+" : "−"}
        {formatCurrency(amount)}
      </span>

      <div
        className="hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(transaction)}
          aria-label="Edit transaction"
          className="min-w-[32px] min-h-[32px]"
        >
          <EditIcon />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(id)}
          className="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 min-w-[32px] min-h-[32px]"
          aria-label="Delete transaction"
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
}
