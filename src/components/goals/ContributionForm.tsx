import { useState, type FormEvent } from 'react'
import type { SavingsGoal } from '../../types'
import { formatCurrency } from '../../utils'
import { Button, Input } from '../ui'

interface ContributionFormProps {
  goal: SavingsGoal
  onSubmit: (amount: number) => void
  onCancel: () => void
}

export default function ContributionForm({ goal, onSubmit, onCancel }: ContributionFormProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | undefined>()

  const remaining = goal.targetAmount - goal.currentAmount

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!amount || isNaN(value) || value <= 0) {
      setError('Enter a valid amount greater than 0')
      return
    }
    if (value > remaining) {
      setError(`Max contribution is ${formatCurrency(remaining)}`)
      return
    }
    onSubmit(value)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-lg px-4 py-3 text-sm border border-indigo-100 dark:border-indigo-900/50">
        <p className="text-indigo-700 dark:text-indigo-300 font-medium">{goal.name}</p>
        <p className="text-indigo-500 dark:text-indigo-400 mt-0.5">
          {formatCurrency(goal.currentAmount)} saved of {formatCurrency(goal.targetAmount)}
          <span className="text-indigo-400 dark:text-indigo-500"> · {formatCurrency(remaining)} to go</span>
        </p>
      </div>
      <Input
        label="Contribution amount"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => { setAmount(e.target.value); setError(undefined) }}
        error={error}
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add contribution</Button>
      </div>
    </form>
  )
}
