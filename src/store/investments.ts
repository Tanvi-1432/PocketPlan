import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InvestmentHolding } from '../types'
import { buildDemoHoldings } from '../constants/demoData'

/**
 * Investment holdings store.
 *
 * Holdings are persisted independently from accounts but reference account IDs
 * from demo data. This mirrors a real finance app where account balances and
 * portfolio lots often arrive from related API resources.
 */
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
          // Stable demo IDs let the seed routine be safely repeated without
          // creating duplicate rows in the holdings table.
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
