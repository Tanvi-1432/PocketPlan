import { useUndoStore } from '../../store/undo'
import { useTransactionsStore } from '../../store/transactions'
import { useBudgetsStore } from '../../store/budgets'
import { useGoalsStore } from '../../store/goals'

export default function ToastContainer() {
  const { toasts, dismissToast } = useUndoStore()

  function handleUndo(toastId: string, action: NonNullable<(typeof toasts)[0]['action']>) {
    dismissToast(toastId)
    switch (action.type) {
      case 'DELETE_TRANSACTION':
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl shadow-xl text-sm font-medium animate-slide-up"
        >
          <span>{toast.message}</span>
          {toast.action && (
            <button
              onClick={() => handleUndo(toast.id, toast.action!)}
              className="text-indigo-400 dark:text-indigo-600 hover:text-indigo-300 dark:hover:text-indigo-500 font-semibold transition-colors"
            >
              Undo
            </button>
          )}
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-200 dark:hover:text-slate-700 transition-colors ml-1"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
