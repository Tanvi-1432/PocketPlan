import { useState } from 'react'
import type { SavingsGoal } from '../types'
import { useGoalsStore } from '../store/goals'
import { Button, Modal } from '../components/ui'
import GoalForm from '../components/goals/GoalForm'
import GoalCard from '../components/goals/GoalCard'
import ContributionForm from '../components/goals/ContributionForm'

/**
 * Savings Goals page.
 *
 * Responsibilities:
 * - Manage goal create/edit and contribution modal state.
 * - Split goals into active vs completed groups.
 * - Delegate progress math and projected dates to goal components.
 */
export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, addContribution } = useGoalsStore()

  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [contributeModalOpen, setContributeModalOpen] = useState(false)
  const [editing, setEditing] = useState<SavingsGoal | null>(null)
  const [contributing, setContributing] = useState<SavingsGoal | null>(null)

  function openAdd() { setEditing(null); setGoalModalOpen(true) }
  function openEdit(goal: SavingsGoal) { setEditing(goal); setGoalModalOpen(true) }
  function openContribute(goal: SavingsGoal) { setContributing(goal); setContributeModalOpen(true) }

  function handleGoalSubmit(data: Omit<SavingsGoal, 'id' | 'currentAmount'>) {
    if (editing) { updateGoal(editing.id, data) } else { addGoal(data) }
    setGoalModalOpen(false)
  }

  function handleContribution(amount: number) {
    if (!contributing) return
    // Store clamps contribution totals at targetAmount, so completed goals
    // cannot exceed 100% even if the user enters a large contribution.
    addContribution(contributing.id, amount)
    setContributeModalOpen(false)
  }

  // Derived groups keep rendering simple and make the page's information
  // architecture obvious: unfinished goals first, completed goals second.
  const active = goals.filter((g) => g.currentAmount < g.targetAmount)
  const complete = goals.filter((g) => g.currentAmount >= g.targetAmount)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Savings Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track progress towards your financial goals</p>
        </div>
        <Button onClick={openAdd}>+ New goal</Button>
      </div>

      {goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No savings goals yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs mb-6">
            Start your first goal to track progress toward something important.
          </p>
          <Button onClick={openAdd}>Create a goal</Button>
        </div>
      )}

      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">In progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onEdit={() => openEdit(goal)} onDelete={() => deleteGoal(goal.id)} onContribute={() => openContribute(goal)} />
            ))}
          </div>
        </section>
      )}

      {complete.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Completed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complete.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onEdit={() => openEdit(goal)} onDelete={() => deleteGoal(goal.id)} onContribute={() => openContribute(goal)} />
            ))}
          </div>
        </section>
      )}

      <Modal isOpen={goalModalOpen} onClose={() => setGoalModalOpen(false)} title={editing ? 'Edit goal' : 'New savings goal'}>
        <GoalForm initial={editing ?? undefined} onSubmit={handleGoalSubmit} onCancel={() => setGoalModalOpen(false)} />
      </Modal>

      <Modal isOpen={contributeModalOpen} onClose={() => setContributeModalOpen(false)} title="Add contribution">
        {contributing && (
          <ContributionForm goal={contributing} onSubmit={handleContribution} onCancel={() => setContributeModalOpen(false)} />
        )}
      </Modal>
    </div>
  )
}
