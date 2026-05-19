import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Budget } from '../types'

/**
 * Budget store.
 *
 * Budgets are scoped by category + month. That pair is the business identity,
 * while `id` is the React/storage identity used for updates and rendering.
 */
interface BudgetsState {
  budgets: Budget[]
  setBudget: (data: Omit<Budget, 'id'> & { id?: string }) => void
  updateBudget: (id: string, data: Partial<Omit<Budget, 'id'>>) => void
  deleteBudget: (id: string) => void
}

export const useBudgetsStore = create<BudgetsState>()(
  persist(
    (set) => ({
      budgets: [],

      // Upsert by category + month so saving "Food / 2026-05" edits the
      // existing budget instead of creating competing limits for one category.
      // Provided IDs are preserved for deterministic demo data.
      setBudget: (data) =>
        set((state) => {
          const existing = state.budgets.find(
            (b) => b.category === data.category && b.month === data.month
          )
          if (existing) {
            const id = data.id ?? existing.id
            return {
              budgets: state.budgets.map((b) =>
                b.id === existing.id ? { ...b, ...data, id } : b
              ),
            }
          }
          const id = data.id ?? uuidv4()
          return { budgets: [...state.budgets, { ...data, id }] }
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
    // Persist monthly budget limits across refreshes.
    { name: 'pocketplan-budgets' }
  )
)
