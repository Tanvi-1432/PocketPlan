import { useState } from 'react'
import type { Transaction } from '../types'
import { useTransactionsStore } from '../store/transactions'
import { useUndoStore } from '../store/undo'
import { Button, Modal } from '../components/ui'
import TransactionForm from '../components/transactions/TransactionForm'
import TransactionList from '../components/transactions/TransactionList'
import TransactionDetailModal from '../components/transactions/TransactionDetailModal'

/**
 * Transactions page.
 *
 * Responsibilities:
 * - Own add/edit/detail modal state.
 * - Pass persisted transaction data into the searchable/filterable list.
 * - Delete transactions with a toast payload that can be undone.
 */
export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactionsStore()
  const { pushToast } = useUndoStore()

  const [modalOpen, setModalOpen]  = useState(false)
  const [editing, setEditing]      = useState<Transaction | null>(null)
  const [detailTx, setDetailTx]    = useState<Transaction | null>(null)

  function openAdd()                { setEditing(null); setModalOpen(true) }
  function openEdit(t: Transaction) { setEditing(t); setModalOpen(true) }

  function handleSubmit(data: Omit<Transaction, 'id'>) {
    // The same form handles create and edit. Store methods hide whether the
    // transaction needs a new UUID or an update to an existing record.
    if (editing) { updateTransaction(editing.id, data) } else { addTransaction(data) }
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    const tx = transactions.find((t) => t.id === id)
    if (!tx) return
    // Capture the full deleted transaction before removal so the undo toast has
    // everything it needs to restore the item later.
    deleteTransaction(id)
    pushToast(`"${tx.title}" deleted`, { type: 'DELETE_TRANSACTION', payload: tx })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track your income and expenses</p>
        </div>
        <Button onClick={openAdd} className="self-start sm:self-auto shrink-0">+ Add transaction</Button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No transactions yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs mb-6">
            Add your first income or expense to start tracking your cash flow.
          </p>
          <Button onClick={openAdd}>Add transaction</Button>
        </div>
      ) : (
        <TransactionList
          transactions={transactions}
          onEdit={openEdit}
          onDelete={handleDelete}
          onViewDetail={setDetailTx}
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit transaction' : 'Add transaction'}>
        <TransactionForm initial={editing ?? undefined} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>

      <TransactionDetailModal
        transaction={detailTx}
        onClose={() => setDetailTx(null)}
        onEdit={(t) => { setDetailTx(null); openEdit(t) }}
        onDelete={(id) => { handleDelete(id); setDetailTx(null) }}
      />
    </div>
  )
}
