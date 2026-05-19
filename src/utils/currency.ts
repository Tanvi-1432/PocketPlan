import { useSettingsStore } from '../store/settings'
import type { CurrencyCode } from '../types'

/**
 * Currency formatting helpers.
 *
 * These helpers read the latest settings snapshot directly from Zustand so they
 * can be used in utilities as well as React components.
 */

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
}

// Returns current settings snapshot without subscribing (safe in non-React contexts).
function getSettings() {
  return useSettingsStore.getState().settings
}

export function formatCurrency(amount: number): string {
  const { currency, showCents, compactNumbers } = getSettings()
  const locale = CURRENCY_LOCALES[currency] ?? 'en-US'

  if (compactNumbers && Math.abs(amount) >= 1000) {
    // Compact notation powers settings like "$1.2K" while preserving the
    // selected currency and locale rules.
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount)
}

export function formatCompactCurrency(amount: number): string {
  const { currency } = getSettings()
  const locale = CURRENCY_LOCALES[currency] ?? 'en-US'

  if (Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  }
  return formatCurrency(amount)
}
