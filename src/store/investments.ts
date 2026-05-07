import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InvestmentHolding } from '../types'
import { buildDemoHoldings } from '../constants/demoData'

interface InvestmentsState {
  holdings: InvestmentHolding[]
  addHolding: (holding: InvestmentHolding) => void
  upsertHolding: (holding: InvestmentHolding) => void
  updateHolding: (id: string, data: Partial<InvestmentHolding>) => void
  deleteHolding: (id: string) => void
  loadDemoHoldings: () => void
  clearHoldings: () => void
}

export const useInvestmentsStore = create<InvestmentsState>()(
  persist(
    (set) => ({
      holdings: [],

      addHolding: (holding) =>
        set((state) => ({ holdings: [...state.holdings, holding] })),

      upsertHolding: (holding) =>
        set((state) => {
          const exists = state.holdings.some((h) => h.id === holding.id)
          if (exists) {
            return { holdings: state.holdings.map((h) => (h.id === holding.id ? holding : h)) }
          }
          return { holdings: [...state.holdings, holding] }
        }),

      updateHolding: (id, data) =>
        set((state) => ({
          holdings: state.holdings.map((h) => (h.id === id ? { ...h, ...data } : h)),
        })),

      deleteHolding: (id) =>
        set((state) => ({ holdings: state.holdings.filter((h) => h.id !== id) })),

      loadDemoHoldings: () => set({ holdings: buildDemoHoldings() }),

      clearHoldings: () => set({ holdings: [] }),
    }),
    { name: 'pocketplan-investments' }
  )
)
