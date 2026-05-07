import type { Category, TransactionType } from '../types'

interface CategorizationRule {
  keywords: string[]
  category: Category
  type?: TransactionType
}

const RULES: CategorizationRule[] = [
  // Income
  { keywords: ['payroll', 'salary', 'direct deposit', 'wages', 'paycheck'], category: 'Salary', type: 'income' },
  { keywords: ['freelance', 'consulting', 'contract', 'upwork', 'fiverr'], category: 'Freelance', type: 'income' },
  { keywords: ['dividend', 'interest payment', 'capital gain', 'investment income'], category: 'Investment', type: 'income' },

  // Housing
  { keywords: ['rent', 'mortgage', 'hoa', 'property tax', 'lease'], category: 'Housing' },

  // Food & Dining
  { keywords: ['starbucks', 'coffee', 'dunkin', 'peet\'s'], category: 'Food' },
  { keywords: ['mcdonald', 'burger king', 'wendy\'s', 'taco bell', 'chick-fil-a', 'kfc', 'subway', 'chipotle', 'panera', 'five guys'], category: 'Food' },
  { keywords: ['whole foods', 'trader joe', 'kroger', 'safeway', 'publix', 'aldi', 'costco', 'walmart grocery', 'instacart', 'doordash', 'grubhub', 'ubereats', 'door dash'], category: 'Food' },
  { keywords: ['restaurant', 'dining', 'pizza', 'sushi', 'cafe', 'bakery', 'deli', 'grocery', 'supermarket', 'food', 'market'], category: 'Food' },

  // Transport
  { keywords: ['shell', 'chevron', 'bp', 'exxon', 'mobil', 'speedway', 'gas station', 'fuel', 'gasoline'], category: 'Transport' },
  { keywords: ['uber', 'lyft', 'taxi', 'grab', 'transit', 'metro', 'subway fare', 'train fare', 'bus fare', 'parking', 'toll'], category: 'Transport' },
  { keywords: ['geico', 'progressive', 'state farm', 'allstate', 'car insurance', 'auto insurance'], category: 'Transport' },
  { keywords: ['car payment', 'auto loan', 'vehicle'], category: 'Transport' },

  // Healthcare
  { keywords: ['pharmacy', 'cvs', 'walgreens', 'rite aid', 'doctor', 'hospital', 'clinic', 'dental', 'vision', 'optometrist', 'medical'], category: 'Healthcare' },
  { keywords: ['gym', 'planet fitness', 'gold\'s gym', 'la fitness', 'anytime fitness', 'equinox', 'peloton', 'fitness'], category: 'Healthcare' },
  { keywords: ['health insurance', 'copay', 'deductible', 'prescription'], category: 'Healthcare' },

  // Entertainment
  { keywords: ['netflix', 'hulu', 'disney+', 'hbo', 'max', 'peacock', 'paramount', 'apple tv', 'prime video'], category: 'Entertainment' },
  { keywords: ['spotify', 'apple music', 'youtube premium', 'pandora', 'tidal', 'deezer'], category: 'Entertainment' },
  { keywords: ['steam', 'xbox', 'playstation', 'nintendo', 'gaming', 'twitch'], category: 'Entertainment' },
  { keywords: ['movie', 'cinema', 'theater', 'concert', 'ticket', 'amc', 'regal'], category: 'Entertainment' },

  // Shopping
  { keywords: ['amazon', 'ebay', 'etsy', 'walmart', 'target', 'best buy', 'apple store', 'h&m', 'zara', 'gap', 'uniqlo', 'nordstrom', 'macy\'s'], category: 'Shopping' },
  { keywords: ['clothing', 'apparel', 'shoes', 'fashion', 'boutique', 'department store'], category: 'Shopping' },
  { keywords: ['home depot', 'lowe\'s', 'ikea', 'wayfair', 'furniture', 'hardware'], category: 'Shopping' },

  // Education
  { keywords: ['tuition', 'university', 'college', 'school', 'udemy', 'coursera', 'linkedin learning', 'skillshare', 'course', 'textbook', 'education'], category: 'Education' },
  { keywords: ['student loan', 'scholarship'], category: 'Education' },

  // Utilities / Other
  { keywords: ['verizon', 'at&t', 't-mobile', 'sprint', 'phone bill', 'cell phone', 'wireless'], category: 'Other' },
  { keywords: ['electric', 'water bill', 'internet', 'comcast', 'xfinity', 'spectrum', 'utility', 'utilities'], category: 'Other' },
]

export function autoDetectCategory(title: string, type: TransactionType): { category: Category; confident: boolean } {
  const lower = title.toLowerCase()

  for (const rule of RULES) {
    if (rule.type && rule.type !== type) continue
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return { category: rule.category, confident: true }
    }
  }

  return { category: type === 'income' ? 'Other' : 'Other', confident: false }
}

export function suggestCategory(title: string, type: TransactionType): Category {
  return autoDetectCategory(title, type).category
}
