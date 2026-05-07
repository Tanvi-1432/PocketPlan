import type { Transaction, DetectedSubscription, RecurringFrequency } from '../types'
import { addFrequencyDays } from './recurring'

// Normalize merchant name to a stable key
function normalizeKey(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
}

// Detect approximate frequency from day-gaps between occurrences
function detectFrequency(gaps: number[]): RecurringFrequency | null {
  if (gaps.length === 0) return null
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length
  if (avg <= 2)   return 'daily'
  if (avg <= 9)   return 'weekly'
  if (avg <= 19)  return 'biweekly'
  if (avg <= 45)  return 'monthly'
  if (avg <= 400) return 'yearly'
  return null
}

export function detectSubscriptions(transactions: Transaction[]): DetectedSubscription[] {
  const expenses = transactions.filter((t) => t.type === 'expense')

  // Group by normalized title
  const byKey = new Map<string, Transaction[]>()
  for (const t of expenses) {
    const key = normalizeKey(t.title)
    if (!byKey.has(key)) byKey.set(key, [])
    byKey.get(key)!.push(t)
  }

  const subs: DetectedSubscription[] = []

  for (const [key, txs] of byKey) {
    if (txs.length < 2) continue

    const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date))

    // Compute day-gaps between consecutive occurrences
    const gaps: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date).getTime()
      const curr = new Date(sorted[i].date).getTime()
      gaps.push(Math.round((curr - prev) / (1000 * 60 * 60 * 24)))
    }

    const freq = detectFrequency(gaps)
    if (!freq) continue

    // Check amount consistency (within 10%)
    const amounts = sorted.map((t) => t.amount)
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const allConsistent = amounts.every((a) => Math.abs(a - avgAmount) / avgAmount < 0.1)
    if (!allConsistent && sorted.length < 3) continue

    const last = sorted[sorted.length - 1]
    const nextExpected = addFrequencyDays(last.date, freq)

    subs.push({
      seriesKey: key,
      title: last.title,
      amount: Math.round(avgAmount * 100) / 100,
      frequency: freq,
      lastCharged: last.date,
      nextExpected,
      occurrences: sorted.length,
      category: last.category,
    })
  }

  // Sort by monthly cost descending
  return subs.sort((a, b) => {
    const monthlyA = a.frequency === 'yearly' ? a.amount / 12 : a.frequency === 'weekly' ? a.amount * 4.33 : a.amount
    const monthlyB = b.frequency === 'yearly' ? b.amount / 12 : b.frequency === 'weekly' ? b.amount * 4.33 : b.amount
    return monthlyB - monthlyA
  })
}

export function monthlySubscriptionTotal(subs: DetectedSubscription[]): number {
  return subs.reduce((sum, s) => {
    switch (s.frequency) {
      case 'daily':    return sum + s.amount * 30.44
      case 'weekly':   return sum + s.amount * 4.33
      case 'biweekly': return sum + s.amount * 2.17
      case 'monthly':  return sum + s.amount
      case 'yearly':   return sum + s.amount / 12
    }
  }, 0)
}
