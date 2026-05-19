import { useUndoStore } from '../../store/undo'
import { useTransactionsStore } from '../../store/transactions'
import { useBudgetsStore } from '../../store/budgets'
import { useGoalsStore } from '../../store/goals'

/**
 * Global toast container with undo support.
 *
 * Mounted once in App/Layout so any page can push a toast through the undo
 * store. Undo handlers use store `getState()` to restore data without needing
 * this component to subscribe to every domain store.
 */
export default function ToastContainer() {
  const { toasts, dismissToast } = useUndoStore()

  function handleUndo(toastId: string, action: NonNullable<(typeof toasts)[0]['action']>) {
    dismissToast(toastId)
    switch (action.type) {
      case 'DELETE_TRANSACTION':
        // Upsert restores the exact deleted object, including its original ID.
        useTransactionsStore.getState().upsertTransaction(action.payload)
        break
      case 'DELETE_BUDGET':
        useBudgetsStore.getState().setBudget(action.payload)
        break
      case 'DELETE_GOAL':
        useGoalsStore.getState().upsertGoal(action.payload)
        break
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-modal text-sm font-medium animate-slide-up"
          style={{
            background: 'rgba(15,23,42,0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e2e8f0',
          }}
        >
          <span className="text-slate-200">{toast.message}</span>
          {toast.action && (
            <button
              onClick={() => handleUndo(toast.id, toast.action!)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1"
            >
              Undo
            </button>
          )}
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
            aria-label="Dismiss"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
