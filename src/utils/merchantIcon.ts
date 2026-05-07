import type { Category } from '../types'
import { CATEGORY_COLORS } from '../constants'

// Returns initials (1-2 chars) and a background color for a merchant
export function getMerchantInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// Predefined colors per merchant keyword for brand-like consistency
const MERCHANT_COLORS: Record<string, string> = {
  starbucks:  '#00704A',
  spotify:    '#1DB954',
  netflix:    '#E50914',
  amazon:     '#FF9900',
  apple:      '#555555',
  uber:       '#000000',
  lyft:       '#FF00BF',
  airbnb:     '#FF5A5F',
  paypal:     '#003087',
  venmo:      '#3D95CE',
  google:     '#4285F4',
  microsoft:  '#00A4EF',
  adobe:      '#FF0000',
  hulu:       '#1CE783',
  disney:     '#006E99',
  youtube:    '#FF0000',
  walmart:    '#0071CE',
  target:     '#CC0000',
  chase:      '#117ACA',
  fidelity:   '#007E33',
  robinhood:  '#00C805',
  verizon:    '#CD040B',
  geico:      '#003399',
  chipotle:   '#A81612',
  dunkin:     '#FF671F',
  mcdonald:   '#FFC72C',
  wholefoods: '#00674B',
  traderjoe:  '#BB1F26',
  shell:      '#FFD500',
  chevron:    '#0078AE',
  planet:     '#7D25C1',
}

export function getMerchantColor(title: string, category: Category): string {
  const lower = title.toLowerCase().replace(/\s+/g, '')
  for (const [key, color] of Object.entries(MERCHANT_COLORS)) {
    if (lower.includes(key)) return color
  }
  return CATEGORY_COLORS[category] ?? '#94a3b8'
}

export function getMerchantIconProps(title: string, category: Category) {
  return {
    initials: getMerchantInitials(title),
    color: getMerchantColor(title, category),
  }
}
