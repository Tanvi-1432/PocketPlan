import { create } from 'zustand'
import type { UndoableAction } from '../types'

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
      toasts: [...state.toasts.slice(-2), { id, message, action, timeoutId }],
    }))
  },

  dismissToast: (id) => {
    set((state) => {
      const toast = state.toasts.find((t) => t.id === id)
      if (toast?.timeoutId) clearTimeout(toast.timeoutId)
      return { toasts: state.toasts.filter((t) => t.id !== id) }
    })
  },

  clearAll: () => {
    get().toasts.forEach((t) => { if (t.timeoutId) clearTimeout(t.timeoutId) })
    set({ toasts: [] })
  },
}))
