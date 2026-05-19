import { create } from 'zustand'
import type { UndoableAction } from '../types'

/**
 * Toast/undo store.
 *
 * This store is intentionally not persisted. Toasts describe short-lived UI
 * actions, and keeping timeout handles in localStorage would be invalid.
 */
export interface ToastItem {
  id: string
  message: string
  action?: UndoableAction
  timeoutId?: ReturnType<typeof setTimeout>
}

interface UndoState {
  toasts: ToastItem[]
  pushToast: (message: string, action?: UndoableAction) => void
  dismissToast: (id: string) => void
  clearAll: () => void
}

const TOAST_DURATION = 4000

export const useUndoStore = create<UndoState>((set, get) => ({
  toasts: [],

  pushToast: (message, action) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const timeoutId = setTimeout(() => get().dismissToast(id), TOAST_DURATION)
    set((state) => ({
      // Keep only a small stack so repeated deletes do not cover the app.
      toasts: [...state.toasts.slice(-2), { id, message, action, timeoutId }],
    }))
  },

  dismissToast: (id) => {
    set((state) => {
      const toast = state.toasts.find((t) => t.id === id)
      // Clear the timeout when dismissed manually to avoid later callbacks
      // trying to remove an already-gone toast.
      if (toast?.timeoutId) clearTimeout(toast.timeoutId)
      return { toasts: state.toasts.filter((t) => t.id !== id) }
    })
  },

  clearAll: () => {
    get().toasts.forEach((t) => { if (t.timeoutId) clearTimeout(t.timeoutId) })
    set({ toasts: [] })
  },
}))
