import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ConnectedAccount } from '../types'
import { DEMO_ACCOUNTS } from '../constants/demoData'

interface AccountsState {
  accounts: ConnectedAccount[]
  isSyncing: boolean
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

      addConnectedAccount: (account) =>
        set((state) => ({ accounts: [...state.accounts, account] })),

      removeConnectedAccount: (id) =>
        set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) })),

      updateConnectedAccount: (id, data) =>
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),

      syncAccounts: async () => {
        // Mark all accounts as syncing
        set((state) => ({
          isSyncing: true,
          accounts: state.accounts.map((a) => ({ ...a, status: 'syncing' as const })),
        }))

        await new Promise<void>((resolve) => setTimeout(resolve, 1800))

        const now = new Date().toISOString()

        // If no accounts yet, load demo set; otherwise just refresh balances/timestamps
        if (get().accounts.length === 0 || get().accounts.every((a) => a.status === 'syncing')) {
          set({
            isSyncing: false,
            accounts: DEMO_ACCOUNTS.map((a) => ({ ...a, lastSynced: now, status: 'connected' as const })),
          })
        } else {
          set((state) => ({
            isSyncing: false,
            accounts: state.accounts.map((a) => ({
              ...a,
              lastSynced: now,
              status: 'connected' as const,
            })),
          }))
        }
      },

      clearConnectedAccounts: () => set({ accounts: [], isSyncing: false }),
    }),
    { name: 'pocketplan-accounts' }
  )
)
