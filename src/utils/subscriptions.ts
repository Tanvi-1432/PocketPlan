import type { Transaction, DetectedSubscription, RecurringFrequency, Category } from '../types'
import { addFrequencyDays } from './recurring'

// ---------------------------------------------------------------------------
// Known subscription merchant keywords (lowercased, stripped)
// A transaction whose normalized key contains one of these is a strong signal.
// ---------------------------------------------------------------------------
const KNOWN_SUB_KEYWORDS: string[] = [
  'netflix', 'spotify', 'hulu', 'disney', 'applemusic', 'appleone',
  'icloud', 'youtubepremium', 'youtube', 'amazonprime', 'primevideo',
  'adobecreative', 'adobe', 'notion', 'chatgpt', 'openai',
  'planetfitness', 'crunchfitness', 'anytimefitness',
  'comcast', 'xfinity', 'verizon', 'att', 'tmobile',
  'dropbox', 'github', 'duolingo', 'calm', 'headspace',
  'nytimes', 'wsj', 'washingtonpost', 'medium',
  'lastpass', 'nordvpn', 'expressvpn',
  'playstation', 'xbox', 'nintendoswitch',
]

// Categories that are never subscriptions (too variable / not services)
const EXCLUDED_CATEGORIES = new Set<Category>([
  'Food', 'Transport', 'Shopping', 'Salary', 'Freelance', 'Investment',
])

// ---------------------------------------------------------------------------
// Normalize a merchant title to a stable grouping key.
// Strips punctuation, extra words like "Premium"/"Plus", bank prefixes, etc.
// ---------------------------------------------------------------------------
export function normalizeMerchantKey(title: string): string {
  return title
    .toLowerCase()
    // Remove common bank-statement noise prefixes
    .replace(/^(google\s*\*|apple\s*\*|amzn\s*\*|paypal\s*\*|sq\s*\*|tst\s*\*)/g, '')
    // Strip everything that isn't a letter or digit
    .replace(/[^a-z0-9]/g, '')
    // Normalise known aliases so they group together
    .replace(/youtubepremi(um)?/, 'youtubepremium')
    .replace(/spotifypremi(um)?/, 'spotify')
    .replace(/netflixcom/, 'netflix')
    .replace(/amazonprimevideo/, 'amazonprime')
    .replace(/primevideo/, 'amazonprime')
    .slice(0, 24)
}

// Is this key a known subscription service?
function isKnownSubscription(key: string): boolean {
  return KNOWN_SUB_KEYWORDS.some((kw) => key.includes(kw))
}

// ---------------------------------------------------------------------------
// Detect approximate frequency from day-gaps between consecutive charges.
// ---------------------------------------------------------------------------
function detectFrequency(gaps: number[]): RecurringFrequency | null {
  if (gaps.length === 0) return null
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length
  if (avg <= 2)   return 'daily'
  if (avg <= 10)  return 'weekly'
  if (avg <= 20)  return 'biweekly'
  if (avg <= 46)  return 'monthly'   // 28–46 day window for monthly billing
  if (avg <= 400) return 'yearly'
  return null
}

// Amount consistency: all charges within ±15% of the group average
function amountsAreConsistent(amounts: number[]): boolean {
  if (amounts.length <= 1) return true
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
  return amounts.every((a) => Math.abs(a - avg) / avg <= 0.15)
}

// ---------------------------------------------------------------------------
// Main detection entry point
// ---------------------------------------------------------------------------
export function detectSubscriptions(transactions: Transaction[]): DetectedSubscription[] {
  // Only look at expenses in non-excluded categories
  const expenses = transactions.filter(
    (t) => t.type === 'expense' && !EXCLUDED_CATEGORIES.has(t.category)
  )

  // Group by normalized merchant key
  const byKey = new Map<string, Transaction[]>()
  for (const t of expenses) {
    const key = normalizeMerchantKey(t.title)
    if (!byKey.has(key)) byKey.set(key, [])
    byKey.get(key)!.push(t)
  }

  const subs: DetectedSubscription[] = []

  for (const [key, txs] of byKey) {
    const known = isKnownSubscription(key)

    // Sort oldest → newest
    const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date))

    // Deduplicate by month (keep the one closest to the median day)
    // This prevents double-counting if someone manually re-added a synced tx
    const byMonth = new Map<string, Transaction>()
    for (const t of sorted) {
      const mk = t.date.slice(0, 7)
      if (!byMonth.has(mk)) byMonth.set(mk, t)
    }
    const deduped = [...byMonth.values()].sort((a, b) => a.date.localeCompare(b.date))

    // Minimum occurrences: 2 for known merchants, 3 for unknown ones
    const minOccurrences = known ? 2 : 3
    if (deduped.length < minOccurrences) continue

    // Compute day-gaps between consecutive charges
    const gaps: number[] = []
    for (let i = 1; i < deduped.length; i++) {
      const prev = new Date(deduped[i - 1].date + 'T00:00:00').getTime()
      const curr = new Date(deduped[i].date + 'T00:00:00').getTime()
      gaps.push(Math.round((curr - prev) / 86_400_000))
    }

    const freq = detectFrequency(gaps)

    // For unknown merchants, require a clear monthly/yearly pattern
    if (!freq) continue
    if (!known && freq !== 'monthly' && freq !== 'yearly') continue

    // Amount consistency check (relaxed for known merchants)
    const amounts = deduped.map((t) => t.amount)
    const consistent = amountsAreConsistent(amounts)
    if (!consistent && !known) continue

    const avgAmount = Math.round((amounts.reduce((a, b) => a + b, 0) / amounts.length) * 100) / 100
    const last = deduped[deduped.length - 1]
    const nextExpected = addFrequencyDays(last.date, freq)

    subs.push({
      seriesKey: key,
      title: last.title,
      amount: avgAmount,
      frequency: freq,
      lastCharged: last.date,
      nextExpected,
      occurrences: deduped.length,
      category: last.category,
    })
  }

  // Sort by descending monthly cost
  return subs.sort((a, b) => {
    const monthly = (s: DetectedSubscription) => {
      switch (s.frequency) {
        case 'daily':    return s.amount * 30.44
        case 'weekly':   return s.amount * 4.33
        case 'biweekly': return s.amount * 2.17
        case 'monthly':  return s.amount
        case 'yearly':   return s.amount / 12
      }
    }
    return monthly(b) - monthly(a)
  })
}

// ---------------------------------------------------------------------------
// Monthly cost total across all detected subscriptions
// ---------------------------------------------------------------------------
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
