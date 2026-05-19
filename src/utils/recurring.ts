import type { RecurringFrequency, Transaction } from '../types'

/**
 * Recurring transaction helpers.
 *
 * These helpers power manual recurring transactions and subscription-style
 * monthly equivalents used in analytics.
 */

export function addFrequencyDays(dateStr: string, freq: RecurringFrequency): string {
  const d = new Date(dateStr + 'T00:00:00')
  switch (freq) {
    case 'daily':    d.setDate(d.getDate() + 1);    break
    case 'weekly':   d.setDate(d.getDate() + 7);    break
    case 'biweekly': d.setDate(d.getDate() + 14);   break
    case 'monthly':  d.setMonth(d.getMonth() + 1);  break
    case 'yearly':   d.setFullYear(d.getFullYear() + 1); break
  }
  return d.toISOString().slice(0, 10)
}

export function getFrequencyLabel(freq: RecurringFrequency): string {
  const labels: Record<RecurringFrequency, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  }
  return labels[freq]
}

export function computeNextOccurrence(transaction: Transaction): string | undefined {
  if (!transaction.isRecurring || !transaction.recurringFrequency) return undefined
  return addFrequencyDays(transaction.date, transaction.recurringFrequency)
}

/**
 * Generate upcoming occurrences of a recurring transaction up to a horizon.
 *
 * Existing dates in the same series are skipped, which prevents creating
 * duplicates if generation runs more than once.
 */
export function generateUpcomingRecurring(
  source: Transaction,
  existingTransactions: Transaction[],
  horizonDate: string,
): Transaction[] {
  if (!source.isRecurring || !source.recurringFrequency || !source.recurringSeriesId) return []

  const existingDates = new Set(
    existingTransactions
      .filter((t) => t.recurringSeriesId === source.recurringSeriesId)
      .map((t) => t.date)
  )

  const results: Transaction[] = []
  let current = addFrequencyDays(source.date, source.recurringFrequency)

  while (current <= horizonDate && results.length < 24) {
    if (!existingDates.has(current)) {
      results.push({
        ...source,
        // Deterministic occurrence IDs make each future date stable.
        id: `${source.recurringSeriesId}-${current}`,
        date: current,
        source: 'manual',
        importedAt: undefined,
      })
    }
    current = addFrequencyDays(current, source.recurringFrequency)
  }

  return results
}

// Monthly cost equivalent for any frequency; useful for comparing subscriptions
// with different billing cadences on one chart/card.
export function monthlyEquivalent(amount: number, freq: RecurringFrequency): number {
  switch (freq) {
    case 'daily':    return amount * 30.44
    case 'weekly':   return amount * 4.33
    case 'biweekly': return amount * 2.17
    case 'monthly':  return amount
    case 'yearly':   return amount / 12
  }
}
