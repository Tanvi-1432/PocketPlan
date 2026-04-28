import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { SavingsGoal } from '../types'

interface GoalsState {
  goals: SavingsGoal[]
  addGoal: (data: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void
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
