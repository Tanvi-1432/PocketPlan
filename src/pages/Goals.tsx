import { useState } from 'react'
import type { SavingsGoal } from '../types'
import { useGoalsStore } from '../store/goals'
import { Button, Modal } from '../components/ui'
import GoalForm from '../components/goals/GoalForm'
import GoalCard from '../components/goals/GoalCard'
import ContributionForm from '../components/goals/ContributionForm'

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, addContribution } = useGoalsStore()

  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [contributeModalOpen, setContributeModalOpen] = useState(false)
  const [editing, setEditing] = useState<SavingsGoal | null>(null)
  const [contributing, setContributing] = useState<SavingsGoal | null>(null)

  function openAdd() {
    setEditing(null)
    setGoalModalOpen(true)
  }

  function openEdit(goal: SavingsGoal) {
    setEditing(goal)
    setGoalModalOpen(true)
  }

  function openContribute(goal: SavingsGoal) {
    setContributing(goal)
    setContributeModalOpen(true)
  }

  function handleGoalSubmit(data: Omit<SavingsGoal, 'id' | 'currentAmount'>) {
    if (editing) {
      updateGoal(editing.id, data)
    } else {
      addGoal(data)
    }
    setGoalModalOpen(false)
  }

  function handleContribution(amount: number) {
    if (!contributing) return
    addContribution(contributing.id, amount)
    setContributeModalOpen(false)
  }

  const active = goals.filter((g) => g.currentAmount < g.targetAmount)
  const complete = goals.filter((g) => g.currentAmount >= g.targetAmount)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track progress towards your financial goals</p>
        </div>
        <Button onClick={openAdd}>+ New goal</Button>
      </div>

      {/* Empty state */}
      {goals.length === 0 && (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">◈</p>
          <p className="text-base font-medium text-gray-500">No savings goals yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Create a goal and track your progress over time
          </p>
          <Button onClick={openAdd}>+ New goal</Button>
        </div>
      )}

      {/* Active goals */}
      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            In progress
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => openEdit(goal)}
                onDelete={() => deleteGoal(goal.id)}
                onContribute={() => openContribute(goal)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed goals */}
      {complete.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Completed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complete.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => openEdit(goal)}
                onDelete={() => deleteGoal(goal.id)}
                onContribute={() => openContribute(goal)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Goal modal */}
      <Modal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title={editing ? 'Edit goal' : 'New savings goal'}
      >
        <GoalForm
          initial={editing ?? undefined}
          onSubmit={handleGoalSubmit}
          onCancel={() => setGoalModalOpen(false)}
        />
      </Modal>

      {/* Contribution modal */}
      <Modal
        isOpen={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
        title="Add contribution"
      >
        {contributing && (
          <ContributionForm
            goal={contributing}
            onSubmit={handleContribution}
            onCancel={() => setContributeModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  )
}
