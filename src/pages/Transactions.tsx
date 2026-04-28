import { useState } from 'react'
import type { Transaction } from '../types'
import { useTransactionsStore } from '../store'
import { Button, Modal } from '../components/ui'
import TransactionForm from '../components/transactions/TransactionForm'
import TransactionList from '../components/transactions/TransactionList'

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } =
    useTransactionsStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(t: Transaction) {
    setEditing(t)
    setModalOpen(true)
  }

  function handleSubmit(data: Omit<Transaction, 'id'>) {
    if (editing) {
      updateTransaction(editing.id, data)
    } else {
      addTransaction(data)
    }
    setModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your income and expenses</p>
        </div>
        <Button onClick={openAdd}>+ Add transaction</Button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">💸</p>
          <p className="text-base font-medium text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Add your first income or expense to get started</p>
          <Button onClick={openAdd}>+ Add transaction</Button>
        </div>
      ) : (
        <TransactionList
          transactions={transactions}
          onEdit={openEdit}
          onDelete={deleteTransaction}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit transaction' : 'Add transaction'}
      >
        <TransactionForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
