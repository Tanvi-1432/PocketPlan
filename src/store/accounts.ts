import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ConnectedAccount } from '../types'
import { buildDemoAccounts } from '../constants/demoData'

/**
 * Connected account store.
 *
 * There is no real bank API in this demo. `syncAccounts` simulates the two
 * phases a real integration would have: a loading/syncing state, then either
 * initial account hydration or a timestamp refresh.
 */
interface AccountsState {
  accounts: ConnectedAccount[]
  isSyncing: boolean
  setAccounts: (accounts: ConnectedAccount[]) => void
  addConnectedAccount: (account: ConnectedAccount) => void
  removeConnectedAccount: (id: string) => void
  updateConnectedAccount: (id: string, data: Partial<ConnectedAccount>) => void
  syncAccounts: () => Promise<void>
  clearConnectedAccounts: () => void
}

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set, get) => ({
      accounts: [],
      isSyncing: false,

      setAccounts: (accounts) => set({ accounts }),

      addConnectedAccount: (account) =>
        set((state) => ({ accounts: [...state.accounts, account] })),

      removeConnectedAccount: (id) =>
        set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) })),

      updateConnectedAccount: (id, data) =>
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),

      syncAccounts: async () => {
        // Mark every visible card as syncing immediately so the UI reflects
        // work in progress during the simulated network delay.
        set((state) => ({
          isSyncing: true,
          accounts: state.accounts.map((a) => ({ ...a, status: 'syncing' as const })),
        }))

        await new Promise<void>((resolve) => setTimeout(resolve, 1800))

        const now = new Date().toISOString()
        const current = get().accounts

        if (current.length === 0 || current.every((a) => a.status === 'syncing')) {
          // First sync: hydrate the full deterministic demo account set.
          set({ isSyncing: false, accounts: buildDemoAccounts(now) })
        } else {
          // Re-sync: refresh the canonical demo account balances as well as
          // timestamps so account totals stay aligned with demo holdings.
          set({ isSyncing: false, accounts: buildDemoAccounts(now) })
        }
      },

      clearConnectedAccounts: () => set({ accounts: [], isSyncing: false }),
    }),
    { name: 'pocketplan-accounts' }
  )
)
