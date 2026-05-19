import type { ConnectedAccount, InvestmentHolding, Transaction, Budget, SavingsGoal } from '../types'

/**
 * Demo data factory for PocketPlan.
 *
 * This file creates a realistic local finance dataset without contacting any
 * external service. IDs are stable so repeated seeding can upsert records, and
 * account IDs act like foreign keys between accounts, transactions, and
 * holdings.
 */

// ---------------------------------------------------------------------------
// Stable account IDs — used as foreign keys in transactions and holdings
// ---------------------------------------------------------------------------
export const DEMO_ACCOUNT_IDS = {
  chaseChecking: 'demo-acc-chase-chk',
  chaseSavings:  'demo-acc-chase-sav',
  capitalOne:    'demo-acc-cap1-cc',
  fidelity:      'demo-acc-fid-brok',
  robinhood:     'demo-acc-rh-brok',
}

// ---------------------------------------------------------------------------
// Accounts — stable IDs, lastSynced populated at runtime
// ---------------------------------------------------------------------------
export function buildDemoAccounts(lastSynced: string = new Date().toISOString()): ConnectedAccount[] {
  return [
    { id: DEMO_ACCOUNT_IDS.chaseChecking, institutionName: 'Chase',       accountName: 'Total Checking', accountType: 'Checking',    balance: 3250.75,  currency: 'USD', lastSynced, status: 'connected' },
    { id: DEMO_ACCOUNT_IDS.chaseSavings,  institutionName: 'Chase',       accountName: 'Savings',        accountType: 'Savings',     balance: 8400.00,  currency: 'USD', lastSynced, status: 'connected' },
    { id: DEMO_ACCOUNT_IDS.capitalOne,    institutionName: 'Capital One', accountName: 'Quicksilver',    accountType: 'Credit Card', balance: -642.35,  currency: 'USD', lastSynced, status: 'connected' },
    { id: DEMO_ACCOUNT_IDS.fidelity,      institutionName: 'Fidelity',    accountName: 'Brokerage',      accountType: 'Brokerage',   balance: 15680.42, currency: 'USD', lastSynced, status: 'connected' },
    { id: DEMO_ACCOUNT_IDS.robinhood,     institutionName: 'Robinhood',   accountName: 'Investing',      accountType: 'Brokerage',   balance: 4275.90,  currency: 'USD', lastSynced, status: 'connected' },
  ]
}

export const DEMO_ACCOUNTS = buildDemoAccounts()

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Returns "YYYY-MM" for a month offset from today (negative = past)
function monthOffset(offset: number): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Returns year/month for a given month offset
function ymOffset(offset: number): { year: number; month: number } {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

// ---------------------------------------------------------------------------
// 12-month historical transaction generator
// ---------------------------------------------------------------------------
export function buildDemoTransactions(): Transaction[] {
  const { chaseChecking, chaseSavings, capitalOne } = DEMO_ACCOUNT_IDS
  const now = new Date().toISOString()

  function synced(accountId: string, institution: string) {
    return { accountId, institutionName: institution, source: 'synced' as const, importedAt: now }
  }

  const txns: Transaction[] = []

  // ── 12-month historical loop ────────────────────────────────────────────
  // Each pass creates one month of income, fixed bills, variable spending, and
  // occasional events. The result gives charts, trends, budgets, and
  // subscription detection enough history to behave like a real account.
  for (let mo = -11; mo <= 0; mo++) {
    const { year, month } = ymOffset(mo)
    const mk = `${year}-${String(month).padStart(2, '0')}`

    // Seasonal multipliers make demo analytics more believable: shopping rises
    // around holidays and discretionary spending nudges up in summer.
    const isHoliday = month === 12 || month === 11
    const isSummer  = month === 6 || month === 7 || month === 8
    const shopMult  = isHoliday ? 2.2 : isSummer ? 1.3 : 1.0

    // Small random jitter prevents charts from looking copy-pasted while stable
    // IDs still prevent duplicates when the data is reloaded.
    function jitter(base: number, pct = 0.10): number {
      return Math.round(base * (1 + (Math.random() * 2 - 1) * pct) * 100) / 100
    }

    // Payroll is intentionally predictable so income-vs-expense charts have a
    // stable baseline across the full history.
    const salaryBase = 3200
    txns.push({
      id: `demo-tx-payroll-${mk}-1`,
      title: 'JPMorgan Chase Payroll',
      amount: jitter(salaryBase, 0.01),
      type: 'income',
      category: 'Salary',
      date: isoDate(year, month, 1),
      ...synced(chaseChecking, 'Chase'),
    })
    txns.push({
      id: `demo-tx-payroll-${mk}-2`,
      title: 'JPMorgan Chase Payroll',
      amount: jitter(salaryBase, 0.01),
      type: 'income',
      category: 'Salary',
      date: isoDate(year, month, 15),
      ...synced(chaseChecking, 'Chase'),
    })

    // Freelance income — most months, variable
    if (month % 3 !== 0 || Math.random() > 0.3) {
      const freelanceAmt = [0, 450, 650, 900, 1200, 850, 500][Math.floor(Math.random() * 7)]
      if (freelanceAmt > 0) {
        txns.push({
          id: `demo-tx-freelance-${mk}`,
          title: 'Freelance Project',
          amount: freelanceAmt,
          type: 'income',
          category: 'Freelance',
          date: isoDate(year, month, Math.floor(Math.random() * 10) + 10),
          source: 'manual',
          importedAt: now,
        })
      }
    }

    // Interest / dividends
    txns.push({
      id: `demo-tx-interest-${mk}`,
      title: 'Interest Payment',
      amount: jitter(12.50 + mo * 0.25, 0.15),
      type: 'income',
      category: 'Investment',
      date: isoDate(year, month, 3),
      ...synced(chaseSavings, 'Chase'),
    })
    if (month % 3 === 0) {
      txns.push({
        id: `demo-tx-dividend-${mk}`,
        title: 'Dividend — SCHD',
        amount: jitter(47.80 + mo * 0.5, 0.08),
        type: 'income',
        category: 'Investment',
        date: isoDate(year, month, 8),
        ...synced(chaseChecking, 'Chase'),
      })
    }

    // ── Fixed monthly expenses ──────────────────────────────────────────

    // Rent — 1st of month
    txns.push({
      id: `demo-tx-rent-${mk}`,
      title: 'Rent Payment',
      amount: 1450.00,
      type: 'expense',
      category: 'Housing',
      date: isoDate(year, month, 2),
      ...synced(chaseChecking, 'Chase'),
    })

    // Utilities — electric/gas varies by season
    const utilBase = (month >= 6 && month <= 9) ? 95 : (month === 12 || month === 1 || month === 2) ? 130 : 85
    txns.push({
      id: `demo-tx-electric-${mk}`,
      title: 'ConEd Electric',
      amount: jitter(utilBase, 0.12),
      type: 'expense',
      category: 'Housing',
      date: isoDate(year, month, 10),
      ...synced(chaseChecking, 'Chase'),
    })

    // Internet
    txns.push({
      id: `demo-tx-internet-${mk}`,
      title: 'Comcast Internet',
      amount: 69.99,
      type: 'expense',
      category: 'Housing',
      date: isoDate(year, month, 5),
      ...synced(capitalOne, 'Capital One'),
    })

    // Phone
    txns.push({
      id: `demo-tx-verizon-${mk}`,
      title: 'Verizon Phone Bill',
      amount: 85.00,
      type: 'expense',
      category: 'Other',
      date: isoDate(year, month, 6),
      ...synced(capitalOne, 'Capital One'),
    })

    // Car insurance
    txns.push({
      id: `demo-tx-geico-${mk}`,
      title: 'GEICO Car Insurance',
      amount: 132.00,
      type: 'expense',
      category: 'Transport',
      date: isoDate(year, month, 14),
      ...synced(chaseChecking, 'Chase'),
    })

    // Gym
    txns.push({
      id: `demo-tx-gym-${mk}`,
      title: 'Planet Fitness',
      amount: 24.99,
      type: 'expense',
      category: 'Healthcare',
      date: isoDate(year, month, 3),
      ...synced(capitalOne, 'Capital One'),
    })

    // Subscriptions repeat monthly with the same merchant and amount. The
    // analytics page uses these patterns to infer recurring services.
    txns.push({
      id: `demo-tx-netflix-${mk}`,
      title: 'Netflix',
      amount: 15.49,
      type: 'expense',
      category: 'Entertainment',
      date: isoDate(year, month, 12),
      ...synced(capitalOne, 'Capital One'),
    })
    txns.push({
      id: `demo-tx-spotify-${mk}`,
      title: 'Spotify Premium',
      amount: 10.99,
      type: 'expense',
      category: 'Entertainment',
      date: isoDate(year, month, 10),
      ...synced(capitalOne, 'Capital One'),
    })
    // YouTube Premium starts mid-year
    if (mo >= -6) {
      txns.push({
        id: `demo-tx-youtube-${mk}`,
        title: 'YouTube Premium',
        amount: 13.99,
        type: 'expense',
        category: 'Entertainment',
        date: isoDate(year, month, 18),
        ...synced(capitalOne, 'Capital One'),
      })
    }
    // ChatGPT Plus (recent months)
    if (mo >= -3) {
      txns.push({
        id: `demo-tx-chatgpt-${mk}`,
        title: 'ChatGPT Plus',
        amount: 20.00,
        type: 'expense',
        category: 'Education',
        date: isoDate(year, month, 7),
        ...synced(capitalOne, 'Capital One'),
      })
    }

    // ── Groceries — 3-5 trips per month ──────────────────────────────────
    // Variable counts and store choices create category totals that change
    // enough for spending comparisons to be interesting.
    const groceryStores = ['Whole Foods Market', "Trader Joe's", 'Costco', 'Kroger', 'Safeway']
    const groceryCount = Math.floor(Math.random() * 3) + 3
    const groceryDays = [4, 9, 14, 19, 25, 28].slice(0, groceryCount)
    groceryDays.forEach((day, i) => {
      const store = groceryStores[i % groceryStores.length]
      const base = store === 'Costco' ? 145 : store === 'Whole Foods Market' ? 88 : 62
      txns.push({
        id: `demo-tx-grocery-${mk}-${i}`,
        title: store,
        amount: jitter(base, 0.18),
        type: 'expense',
        category: 'Food',
        date: isoDate(year, month, day),
        ...synced(capitalOne, 'Capital One'),
      })
    })

    // Dining out — 3-6 times per month
    const restaurants = ['Chipotle', 'Sweetgreen', 'The Cheesecake Factory', 'Shake Shack', "McDonald's", 'Panera Bread', 'Domino\'s Pizza', 'Olive Garden']
    const dineCount = Math.floor(Math.random() * 4) + 3
    const dineDays = [3, 7, 11, 16, 21, 26].slice(0, dineCount)
    dineDays.forEach((day, i) => {
      const r = restaurants[Math.floor(Math.random() * restaurants.length)]
      const base = r === 'The Cheesecake Factory' || r === 'Olive Garden' ? 62 : r === 'Chipotle' || r === 'Sweetgreen' ? 16 : 22
      txns.push({
        id: `demo-tx-dining-${mk}-${i}`,
        title: r,
        amount: jitter(base, 0.20),
        type: 'expense',
        category: 'Food',
        date: isoDate(year, month, day),
        ...synced(capitalOne, 'Capital One'),
      })
    })

    // Coffee — multiple per month
    const coffeeCount = Math.floor(Math.random() * 4) + 4
    for (let c = 0; c < coffeeCount; c++) {
      const day = Math.floor(Math.random() * 28) + 1
      const shop = Math.random() > 0.4 ? 'Starbucks' : 'Dunkin'
      txns.push({
        id: `demo-tx-coffee-${mk}-${c}`,
        title: shop,
        amount: jitter(shop === 'Starbucks' ? 6.85 : 4.50, 0.15),
        type: 'expense',
        category: 'Food',
        date: isoDate(year, month, day),
        ...synced(capitalOne, 'Capital One'),
      })
    }

    // ── Transport ──────────────────────────────────────────────────────────
    // Gas (2-3 fillups)
    const gasCount = Math.floor(Math.random() * 2) + 2
    for (let g = 0; g < gasCount; g++) {
      const day = Math.floor(Math.random() * 28) + 1
      txns.push({
        id: `demo-tx-gas-${mk}-${g}`,
        title: g % 2 === 0 ? 'Shell Gas Station' : 'BP Gas',
        amount: jitter(52.40, 0.20),
        type: 'expense',
        category: 'Transport',
        date: isoDate(year, month, day),
        ...synced(capitalOne, 'Capital One'),
      })
    }
    // Uber/Lyft
    if (Math.random() > 0.35) {
      txns.push({
        id: `demo-tx-uber-${mk}`,
        title: Math.random() > 0.5 ? 'Uber' : 'Lyft',
        amount: jitter(24.50, 0.35),
        type: 'expense',
        category: 'Transport',
        date: isoDate(year, month, Math.floor(Math.random() * 25) + 3),
        ...synced(capitalOne, 'Capital One'),
      })
    }

    // ── Shopping — spikes in Nov/Dec ─────────────────────────────────────
    // Amazon — always
    const amazonCount = isHoliday ? 4 : Math.floor(Math.random() * 2) + 1
    for (let a = 0; a < amazonCount; a++) {
      const base = isHoliday ? jitter(85, 0.50) : jitter(38.99, 0.40)
      txns.push({
        id: `demo-tx-amazon-${mk}-${a}`,
        title: 'Amazon Order',
        amount: base * shopMult / (isHoliday ? 1 : shopMult),
        type: 'expense',
        category: 'Shopping',
        date: isoDate(year, month, Math.floor(Math.random() * 26) + 2),
        ...synced(capitalOne, 'Capital One'),
      })
    }
    // Clothing — occasional
    if (Math.random() > 0.55 || isHoliday) {
      const store = ['H&M Clothing', 'Zara', 'Target', 'SHEIN', 'Nike'][Math.floor(Math.random() * 5)]
      txns.push({
        id: `demo-tx-clothing-${mk}`,
        title: store,
        amount: jitter(isHoliday ? 120 : 65, 0.30) * (isHoliday ? 1.4 : 1),
        type: 'expense',
        category: 'Shopping',
        date: isoDate(year, month, Math.floor(Math.random() * 20) + 5),
        ...synced(capitalOne, 'Capital One'),
      })
    }
    // Big purchase months (random)
    if (isHoliday && Math.random() > 0.4) {
      txns.push({
        id: `demo-tx-bigpurchase-${mk}`,
        title: month === 11 ? 'Best Buy Electronics' : 'Apple Store',
        amount: jitter(month === 11 ? 299 : 449, 0.15),
        type: 'expense',
        category: 'Shopping',
        date: isoDate(year, month, month === 11 ? 25 : 26),
        ...synced(capitalOne, 'Capital One'),
      })
    }

    // ── Healthcare ─────────────────────────────────────────────────────────
    if (Math.random() > 0.60) {
      const appt = ['CVS Pharmacy', 'Walgreens', 'Doctor Copay', 'Dental Cleaning'][Math.floor(Math.random() * 4)]
      txns.push({
        id: `demo-tx-health-${mk}`,
        title: appt,
        amount: jitter(appt.includes('Dental') ? 150 : appt.includes('Doctor') ? 35 : 28, 0.15),
        type: 'expense',
        category: 'Healthcare',
        date: isoDate(year, month, Math.floor(Math.random() * 20) + 5),
        ...synced(capitalOne, 'Capital One'),
      })
    }

    // ── Education ──────────────────────────────────────────────────────────
    if (Math.random() > 0.65) {
      const course = ['Udemy Course', 'Coursera Subscription', 'O\'Reilly Learning', 'Kindle Books'][Math.floor(Math.random() * 4)]
      txns.push({
        id: `demo-tx-edu-${mk}`,
        title: course,
        amount: jitter(course === 'Coursera Subscription' ? 59 : course === 'O\'Reilly Learning' ? 49 : course === 'Udemy Course' ? 15 : 12, 0.10),
        type: 'expense',
        category: 'Education',
        date: isoDate(year, month, Math.floor(Math.random() * 20) + 5),
        ...synced(capitalOne, 'Capital One'),
      })
    }

    // ── Savings transfer — most months ────────────────────────────────────
    // Modeled as an expense because it leaves checking cash flow, even though
    // in a full double-entry system this would be an internal transfer.
    const savingsAmt = [150, 200, 250, 300, 350, 400, 500][Math.floor(Math.random() * 7)]
    txns.push({
      id: `demo-tx-savings-${mk}`,
      title: 'Transfer to Savings',
      amount: savingsAmt,
      type: 'expense',
      category: 'Savings',
      date: isoDate(year, month, 16),
      ...synced(chaseChecking, 'Chase'),
    })

    // ── Investment contribution ────────────────────────────────────────────
    if (Math.random() > 0.25) {
      txns.push({
        id: `demo-tx-invest-${mk}`,
        title: 'Fidelity Investment',
        amount: jitter(300, 0.20),
        type: 'expense',
        category: 'Investment',
        date: isoDate(year, month, 20),
        ...synced(chaseChecking, 'Chase'),
      })
    }

    // ── Entertainment — concerts, movies ──────────────────────────────────
    if (Math.random() > 0.50) {
      const evt = ['AMC Movie Tickets', 'Eventbrite', 'StubHub', 'Broadway Tickets'][Math.floor(Math.random() * 4)]
      txns.push({
        id: `demo-tx-event-${mk}`,
        title: evt,
        amount: jitter(evt.includes('Broadway') ? 145 : evt.includes('AMC') ? 28 : 65, 0.25),
        type: 'expense',
        category: 'Entertainment',
        date: isoDate(year, month, Math.floor(Math.random() * 22) + 5),
        ...synced(capitalOne, 'Capital One'),
      })
    }

    // ── Travel — summer and holiday ────────────────────────────────────────
    if (isSummer && month === 7) {
      txns.push({
        id: `demo-tx-hotel-${mk}`,
        title: 'Marriott Hotels',
        amount: jitter(420, 0.15),
        type: 'expense',
        category: 'Entertainment',
        date: isoDate(year, month, 12),
        ...synced(capitalOne, 'Capital One'),
      })
      txns.push({
        id: `demo-tx-airline-${mk}`,
        title: 'Delta Airlines',
        amount: jitter(385, 0.20),
        type: 'expense',
        category: 'Transport',
        date: isoDate(year, month, 10),
        ...synced(capitalOne, 'Capital One'),
      })
    }
    if (month === 12) {
      txns.push({
        id: `demo-tx-travel-${mk}`,
        title: 'United Airlines',
        amount: jitter(445, 0.18),
        type: 'expense',
        category: 'Transport',
        date: isoDate(year, month, 22),
        ...synced(capitalOne, 'Capital One'),
      })
    }
  }

  return txns
}

// ---------------------------------------------------------------------------
// Budgets — current month + 11 months of history
// ---------------------------------------------------------------------------
export function buildDemoBudgets(): Budget[] {
  // Budget IDs include the month key so historical budget progress can be
  // calculated for every generated month.
  const budgets: Budget[] = []
  for (let mo = -11; mo <= 0; mo++) {
    const mk = monthOffset(mo)
    budgets.push(
      { id: `demo-budget-housing-${mk}`,       category: 'Housing',       limit: 1650, month: mk },
      { id: `demo-budget-food-${mk}`,          category: 'Food',          limit: 500,  month: mk },
      { id: `demo-budget-transport-${mk}`,     category: 'Transport',     limit: 250,  month: mk },
      { id: `demo-budget-entertainment-${mk}`, category: 'Entertainment', limit: 80,   month: mk },
      { id: `demo-budget-shopping-${mk}`,      category: 'Shopping',      limit: 180,  month: mk },
      { id: `demo-budget-healthcare-${mk}`,    category: 'Healthcare',    limit: 100,  month: mk },
    )
  }
  return budgets
}

// ---------------------------------------------------------------------------
// Goals — stable IDs with realistic progress based on history
// ---------------------------------------------------------------------------
export function buildDemoGoals(): SavingsGoal[] {
  // Deadlines are relative to today so the demo stays fresh regardless of when
  // someone opens the project.
  function futureDate(months: number): string {
    const d = new Date()
    d.setMonth(d.getMonth() + months)
    return d.toISOString().slice(0, 10)
  }
  return [
    { id: 'demo-goal-emergency', name: 'Emergency Fund',   targetAmount: 10000, currentAmount: 4800, deadline: futureDate(8) },
    { id: 'demo-goal-vacation',  name: 'Vacation — Japan', targetAmount: 3500,  currentAmount: 2100, deadline: futureDate(5) },
    { id: 'demo-goal-laptop',    name: 'New Laptop',       targetAmount: 1800,  currentAmount: 1350, deadline: futureDate(3) },
  ]
}

export const buildManualDemoGoals = () =>
  buildDemoGoals().map((g) => ({ name: g.name, targetAmount: g.targetAmount, currentAmount: g.currentAmount, deadline: g.deadline }))

// ---------------------------------------------------------------------------
// Holdings — STABLE IDs
// ---------------------------------------------------------------------------
export function buildDemoHoldings(): InvestmentHolding[] {
  // Holding-level market math is precomputed here so components can render
  // tables/charts without duplicating finance formulas.
  function h(
    id: string, accountId: string, symbol: string, name: string,
    quantity: number, averageCost: number, currentPrice: number,
  ): InvestmentHolding {
    const marketValue     = quantity * currentPrice
    const costBasis       = quantity * averageCost
    const gainLoss        = marketValue - costBasis
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0
    return { id, accountId, symbol, name, quantity, averageCost, currentPrice, marketValue, gainLoss, gainLossPercent }
  }
  return [
    h('demo-holding-fxaix', DEMO_ACCOUNT_IDS.fidelity,  'FXAIX', 'Fidelity 500 Index Fund',       42.5,  210.30, 248.76),
    h('demo-holding-msft',  DEMO_ACCOUNT_IDS.fidelity,  'MSFT',  'Microsoft Corporation',          18,    310.00, 378.92),
    h('demo-holding-schd',  DEMO_ACCOUNT_IDS.fidelity,  'SCHD',  'Schwab US Dividend Equity ETF',  60,     72.50,  82.14),
    h('demo-holding-voo',   DEMO_ACCOUNT_IDS.robinhood, 'VOO',   'Vanguard S&P 500 ETF',           12,    410.00, 452.33),
    h('demo-holding-aapl',  DEMO_ACCOUNT_IDS.robinhood, 'AAPL',  'Apple Inc.',                     20,    165.00, 185.42),
    h('demo-holding-nvda',  DEMO_ACCOUNT_IDS.robinhood, 'NVDA',  'NVIDIA Corporation',              8,    480.00, 875.60),
  ]
}
