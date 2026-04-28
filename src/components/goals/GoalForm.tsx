import { useState, type FormEvent } from 'react'
import type { SavingsGoal } from '../../types'
import { Button, Input } from '../ui'

interface GoalFormProps {
  initial?: SavingsGoal
  onSubmit: (data: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void
  onCancel: () => void
}

interface FormState {
  name: string
  targetAmount: string
  deadline: string
}

function initialState(g?: SavingsGoal): FormState {
  return {
    name: g?.name ?? '',
    targetAmount: g?.targetAmount.toString() ?? '',
    deadline: g?.deadline ?? '',
  }
}

export default function GoalForm({ initial, onSubmit, onCancel }: GoalFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(initial))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = 'Name is required'
    const target = parseFloat(form.targetAmount)
    if (!form.targetAmount || isNaN(target) || target <= 0)
      next.targetAmount = 'Enter a valid target amount greater than 0'
    if (!form.deadline) next.deadline = 'Deadline is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      name: form.name.trim(),
      targetAmount: parseFloat(form.targetAmount),
      deadline: form.deadline,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Goal name"
        placeholder="e.g. Emergency fund"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        error={errors.name}
      />
      <Input
        label="Target amount"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="0.00"
        value={form.targetAmount}
        onChange={(e) => set('targetAmount', e.target.value)}
        error={errors.targetAmount}
      />
      <Input
        label="Deadline"
        type="date"
        value={form.deadline}
        onChange={(e) => set('deadline', e.target.value)}
        error={errors.deadline}
        hint="Target date to reach this goal"
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initial ? 'Save changes' : 'Create goal'}
        </Button>
      </div>
    </form>
  )
}
