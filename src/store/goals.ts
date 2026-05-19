import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { SavingsGoal } from '../types'

/**
 * Savings goal store.
 *
 * Goal progress lives as `currentAmount` on each goal. Contributions are
 * clamped to the target so UI progress never exceeds 100%.
 */
interface GoalsState {
  goals: SavingsGoal[]
  addGoal: (data: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void
  upsertGoal: (goal: SavingsGoal) => void
  updateGoal: (id: string, data: Partial<Omit<SavingsGoal, 'id'>>) => void
  deleteGoal: (id: string) => void
  addContribution: (id: string, amount: number) => void
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],

      addGoal: (data) =>
        set((state) => ({
          goals: [...state.goals, { ...data, id: uuidv4(), currentAmount: 0 }],
        })),

      // Upsert by stable id. Demo goals use fixed IDs, which makes repeated
      // demo loads replace the same goals instead of appending duplicates.
      upsertGoal: (goal) =>
        set((state) => {
          const exists = state.goals.some((g) => g.id === goal.id)
          if (exists) {
            return { goals: state.goals.map((g) => (g.id === goal.id ? goal : g)) }
          }
          return { goals: [...state.goals, goal] }
        }),

      updateGoal: (id, data) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      addContribution: (id, amount) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              // Cap at targetAmount so completed goals stay visually complete
              // without showing impossible percentages like 128%.
              ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) }
              : g
          ),
        })),
    }),
    { name: 'pocketplan-goals' }
  )
)
