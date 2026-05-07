import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { SavingsGoal } from '../types'

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

      // Upsert by stable id — preserves user contributions if goal already exists
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
              ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) }
              : g
          ),
        })),
    }),
    { name: 'pocketplan-goals' }
  )
)
