import type { Transaction } from '../../types'
import { formatCurrency, formatDate } from '../../utils'
import { getFrequencyLabel } from '../../utils/recurring'
import { Modal, Button, MerchantAvatar } from '../ui'

interface TransactionDetailModalProps {
  transaction: Transaction | null
  onClose: () => void
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide shrink-0 w-28">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-200 text-right">{value}</span>
    </div>
  )
}

export default function TransactionDetailModal({
  transaction: t,
  onClose,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  if (!t) return null
  const isIncome = t.type === 'income'

  return (
    <Modal isOpen={!!t} onClose={onClose} title="Transaction Details">
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <MerchantAvatar title={t.title} category={t.category} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{t.title}</p>
            <p className={`text-xl font-bold mt-0.5 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {isIncome ? '+' : '−'}{formatCurrency(t.amount)}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-1">
          <Row label="Date"     value={formatDate(t.date)} />
          <Row label="Type"     value={t.type === 'income' ? 'Income' : 'Expense'} />
          <Row label="Category" value={t.category} />
          {t.institutionName && <Row label="Account" value={t.institutionName} />}
          <Row label="Source"   value={t.source === 'synced' ? 'Bank sync' : 'Manual entry'} />
          {t.importedAt && <Row label="Imported" value={formatDate(t.importedAt.slice(0, 10))} />}
          {t.isRecurring && t.recurringFrequency && (
            <Row label="Recurring" value={getFrequencyLabel(t.recurringFrequency)} />
          )}
          {t.autoCategorized && !t.categoryOverridden && (
            <Row label="Category" value={`${t.category} (auto)`} />
          )}
          {t.note && <Row label="Note" value={t.note} />}
          {t.tags && t.tags.length > 0 && <Row label="Tags" value={t.tags.join(', ')} />}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {t.source === 'synced' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 font-medium">
              Synced
            </span>
          )}
          {t.isRecurring && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900 font-medium">
              ↻ Recurring
            </span>
          )}
          {t.autoCategorized && !t.categoryOverridden && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 font-medium">
              Auto-categorized
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" size="sm" onClick={() => { onDelete(t.id); onClose() }}
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600">
            Delete
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { onEdit(t); onClose() }}>
            Edit
          </Button>
        </div>
      </div>
    </Modal>
  )
}
