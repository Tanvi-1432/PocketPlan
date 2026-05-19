import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Transaction } from '../types'

/**
 * Transaction store.
 *
 * Data flow:
 * - Pages/components call these mutation helpers.
 * - Zustand updates in-memory state immediately.
 * - `persist` mirrors the transaction array to localStorage.
 *
 * Demo imports use `upsertTransaction` with stable IDs, while user-created
 * transactions use generated UUIDs through `addTransaction`.
 */
interface TransactionsState {
  transactions: Transaction[]
  addTransaction: (data: Omit<Transaction, 'id'>) => void
  upsertTransaction: (tx: Transaction) => void
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => void
  deleteTransaction: (id: string) => void
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set) => ({
      transactions: [],

      // Manual creation prepends the newest item so lists feel immediately
      // responsive without needing an extra sort before persistence.
      addTransaction: (data) =>
        set((state) => ({
          transactions: [{ ...data, id: uuidv4() }, ...state.transactions],
        })),

      // Upsert by stable id. This is the duplicate-prevention path used by
      // demo seeding and CSV/import-style flows that may run more than once.
      upsertTransaction: (tx) =>
        set((state) => {
          const exists = state.transactions.some((t) => t.id === tx.id)
          if (exists) {
            return { transactions: state.transactions.map((t) => (t.id === tx.id ? tx : t)) }
          }
          return { transactions: [tx, ...state.transactions] }
        }),

      updateTransaction: (id, data) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
    }),
    // localStorage key. Zustand stores `{ state, version }` under this name.
    { name: 'pocketplan-transactions' }
  )
)
