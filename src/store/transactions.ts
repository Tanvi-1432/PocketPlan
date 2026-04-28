import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Transaction } from '../types'

interface TransactionsState {
  transactions: Transaction[]
  addTransaction: (data: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => void
  deleteTransaction: (id: string) => void
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (data) =>
        set((state) => ({
          transactions: [{ ...data, id: uuidv4() }, ...state.transactions],
        })),

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
    { name: 'pocketplan-transactions' }
  )
)
