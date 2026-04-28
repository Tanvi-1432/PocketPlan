import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Budget } from '../types'

interface BudgetsState {
  budgets: Budget[]
  setBudget: (data: Omit<Budget, 'id'>) => void
  updateBudget: (id: string, data: Partial<Omit<Budget, 'id'>>) => void
  deleteBudget: (id: string) => void
}

export const useBudgetsStore = create<BudgetsState>()(
  persist(
    (set) => ({
      budgets: [],

      // Upserts: replaces existing budget for same category+month, or adds new
      setBudget: (data) =>
        set((state) => {
          const existing = state.budgets.find(
            (b) => b.category === data.category && b.month === data.month
          )
          if (existing) {
            return {
              budgets: state.budgets.map((b) =>
                b.id === existing.id ? { ...b, ...data } : b
              ),
            }
          }
          return { budgets: [...state.budgets, { ...data, id: uuidv4() }] }
        }),

      updateBudget: (id, data) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...data } : b
          ),
        })),

      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),
    }),
    { name: 'pocketplan-budgets' }
  )
)
