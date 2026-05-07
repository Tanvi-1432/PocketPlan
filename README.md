# PocketPlan

A premium personal finance dashboard built with React and TypeScript. PocketPlan brings together transaction management, budgeting, goal tracking, investment monitoring, and AI-quality financial analytics into a single polished interface — designed to feel like a real fintech product, not a student project.

**[Launch Live Demo →](https://pocket-plan-plum.vercel.app)**

---

## Overview

PocketPlan simulates the core experience of a modern personal finance app — think Monarch Money or Copilot — without requiring a backend or real bank credentials. It ships with a complete 12-month financial dataset and a full analytics engine built from scratch in TypeScript.

The UI is built around a glassmorphism design language with a pastel ambient palette, dark mode, and native-feeling mobile interactions including an auto-hiding bottom navigation and iPhone safe-area support.

---

## Screenshots

> Add screenshots to `screenshots/` and update these paths.

| Dashboard | Analytics | Transactions |
|---|---|---|
| `screenshots/dashboard-light.png` | `screenshots/analytics.png` | `screenshots/transactions.png` |

| Mobile | Dark Mode | Settings |
|---|---|---|
| `screenshots/mobile.png` | `screenshots/dashboard-dark.png` | `screenshots/settings.png` |

---

## Features

### Financial Tracking
- Full transaction CRUD — add, edit, delete income and expenses with categories, notes, tags, and source tracking
- Filter transactions by month, type, and category with real-time search
- Recurring transaction support with frequency detection (daily, weekly, biweekly, monthly, yearly)
- Auto-categorization of transactions by merchant name with manual override
- CSV import and export for transactions, budgets, and goals
- Undo system — deleted transactions stay recoverable for 4 seconds via toast

### Budgeting & Goals
- Monthly category budgets with real-time progress bars
- Budget adherence tracking across all categories at once
- Savings goal tracking with target amounts, deadlines, and contribution history
- Automatic goal status tags (on track, at risk, completed)

### Smart Analytics
- **Financial Health Score** — weighted 5-factor composite score (savings rate, budget adherence, emergency fund progress, spending consistency, income vs expenses) with a letter grade (A–F) and per-factor suggestions
- **Cash Flow Forecast** — projects month-end balance using actual burn rate, uncommitted recurring income, budget headroom, and a daily safe-to-spend calculation
- **Spending Insights** — automatically generated contextual tips based on the current month's data
- **Category Trends** — 6-month rolling view of spending per category with line charts
- **Month-over-Month Comparisons** — delta amounts and percentages per category with directional indicators
- **Savings Rate Trend** — 12-month sparkline of what percentage of income was saved each month
- **Subscription Detection** — merchant normalization, pattern matching, and per-month deduplication identify recurring charges (Netflix, Spotify, YouTube Premium, etc.) with monthly cost roll-up

### Simulated Banking
- Simulated account sync across checking, savings, credit card, and investment accounts
- Net worth calculation: cash assets + investment value − credit liabilities
- Investment portfolio with per-holding gain/loss, allocation percentages, and a donut chart breakdown
- 12 months of realistic generated demo data: biweekly payroll, groceries, dining, subscriptions, utilities, travel, holiday spending, and investment contributions

### Experience
- Dark mode with system preference detection and manual override, persisted across sessions
- Glassmorphism UI with frosted-glass cards, floating sidebar, and ambient pastel gradients
- Mobile-first responsive layout with a floating pill navigation that auto-hides on scroll and reappears on scroll-up
- iPhone edge-to-edge support: `viewport-fit=cover`, `env(safe-area-inset-*)`, and dynamic `theme-color` meta updates on theme toggle
- Settings system — currency (USD, EUR, GBP, CAD, AUD), date format, number display, and compact notation, with a live preview card
- Animated interactions throughout using Framer Motion

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | Component model, concurrent features |
| TypeScript | 6 | Strict type safety throughout — no `any` |
| Vite | 8 | Build tool and dev server |
| Tailwind CSS | 4 | Utility-first styling with `@variant dark` |
| Zustand | 5 | Global state with `persist` middleware |
| Recharts | 3 | Bar, line, and pie/donut charts |
| Framer Motion | 12 | Page and component animations |
| uuid | 14 | Stable IDs for all entities |
| Vercel | — | Static deployment, SPA routing |

---

## Architecture

```
src/
├── components/
│   ├── ui/              # Primitives: Button, Card, Input, Select, Modal, ProgressBar, MerchantAvatar, Toast
│   ├── dashboard/       # SummaryCard, CategoryChart, MonthlyChart, BudgetProgressList, RecentTransactions
│   ├── transactions/    # TransactionList, TransactionItem, TransactionForm, TransactionFilters, TransactionDetailModal
│   ├── budgets/         # BudgetCard, BudgetForm
│   ├── goals/           # GoalCard, GoalForm, ContributionForm
│   ├── accounts/        # AccountCard, SyncButton
│   ├── investments/     # HoldingsTable, AllocationChart
│   └── Layout.tsx       # App shell — floating sidebar, mobile topbar, auto-hide pill nav
├── pages/               # Dashboard, Transactions, Budgets, Goals, Accounts, Investments, Analytics, Settings
├── store/               # Zustand slices: transactions, budgets, goals, accounts, investments, settings, theme, undo
├── hooks/               # useDemoData, useNavVisibility
├── utils/
│   ├── transactions.ts  # Filtering, grouping, totals
│   ├── budgets.ts       # Budget progress calculations
│   ├── trends.ts        # Category trends, savings rate, month-over-month comparisons
│   ├── healthScore.ts   # 5-factor financial health score engine
│   ├── forecast.ts      # Cash flow projection and safe-to-spend calculation
│   ├── insights.ts      # Automatic contextual insight generation
│   ├── subscriptions.ts # Recurring charge detection via merchant normalization + pattern matching
│   ├── recurring.ts     # Recurring frequency utilities
│   ├── categorization.ts# Auto-categorization by merchant name
│   ├── currency.ts      # Settings-aware formatting (currency, compact notation)
│   ├── date.ts          # Settings-aware date formatting (4 formats)
│   ├── investments.ts   # Portfolio return calculations
│   ├── merchantIcon.ts  # Merchant-to-icon mapping
│   └── csv.ts           # CSV export and import with full parsing and validation
├── types/               # All TypeScript interfaces, union types, and discriminated unions
└── constants/           # Category lists, colors, 12-month demo data generator
```

**Layering rule:** `types` → `constants` → `utils` → `store` → `components` → `pages`. Lower layers never import from higher ones.

---

## Key Systems

### Financial Health Score

Five independently scored factors combine into a weighted composite (0–100) with a letter grade:

| Factor | Weight | Signal |
|---|---|---|
| Savings Rate | 30% | (income − expenses) / income, scaled to 100 |
| Budget Adherence | 25% | Fraction of category budgets not exceeded |
| Emergency Fund | 20% | Progress toward a goal tagged "emergency" or "fund" |
| Spending Consistency | 15% | Month-over-month expense variance |
| Income vs Expenses | 10% | Whether spending exceeds income |

Each factor also surfaces a plain-language suggestion when below a threshold.

### Subscription Detection

Recurring charge detection works in three stages:

1. **Normalization** — merchant names are stripped of bank prefixes (`GOOGLE *`, `AMZN *`, `PAYPAL *`), punctuation, and known aliases (`spotifypremium → spotify`, `youtubepremium → youtubepremium`) to produce a stable grouping key.
2. **Pattern matching** — transactions are grouped by normalized key. Known services (Netflix, Spotify, ChatGPT, iCloud, etc.) need only 2 monthly occurrences to qualify; unknown merchants need 3. Charges are deduplicated per month so synced + manual copies don't double-count.
3. **Frequency inference** — average day-gap between consecutive charges maps to daily / weekly / biweekly / monthly / yearly. Monthly subscriptions use a 20–46 day window to accommodate billing cycle variance. A ±15% amount tolerance handles price changes.

Categories like `Food`, `Transport`, and `Shopping` are excluded to prevent false positives.

### Cash Flow Forecast

Given the current date, the engine:

- Computes the daily average expense rate for the month so far
- Identifies recurring income not yet received this month
- Adds committed recurring expenses not yet charged
- Cross-references remaining budget headroom as a conservative floor
- Derives a **safe-to-spend-per-day** figure: `(available cash − committed outflows) / remaining days`

Confidence level (low / medium / high) is based on how much transaction history is available.

### Demo Data Generation

The 12-month dataset is generated deterministically at runtime — not hardcoded — so it always ends on the current month. It includes:

- Biweekly payroll with small variance, quarterly freelance deposits, and monthly interest income
- Rent on the 1st, seasonal utility costs, fixed subscriptions every month, and variable spending categories
- Holiday spending multipliers in November/December, summer travel in July, and healthcare and education costs throughout
- Parallel budget records for each month matching the spending patterns

A localStorage migration system detects and replaces stale data from older schema versions on app boot.

### Settings System

All display formatting routes through `useSettingsStore.getState()` so utility functions remain callable outside React components. When settings change, `App.tsx`'s store subscription triggers a re-render that cascades through every `formatCurrency` and `formatDate` call in the tree — no prop drilling required.

---

## Local Development

```bash
git clone https://github.com/Tanvi-1432/PocketPlan.git
cd PocketPlan
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). No environment variables or API keys needed.

```bash
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # ESLint check
```

---

## Deployment

PocketPlan is a static SPA deployed on Vercel. `vercel.json` redirects all routes to `index.html` for client-side routing.

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Framework preset | Vite (auto-detected) |

---

## Development Approach

This project was built with **Claude Code** as an AI development assistant. Product direction, feature scoping, UI design decisions, architecture choices, debugging, and iteration were driven manually throughout. Claude Code was used to accelerate implementation — writing and refactoring code, catching type errors, and helping work through edge cases in the financial logic — while the overall product vision and engineering decisions remained human-directed.

This reflects how modern developers actually work: AI as a capable collaborator, not a replacement for product thinking.

---

## Future Roadmap

- [ ] Real [Plaid](https://plaid.com) sandbox integration for live transaction sync
- [ ] User authentication and cloud persistence (Supabase or Firebase)
- [ ] AI-powered financial assistant using a language model API
- [ ] PWA support with offline mode and push notifications for budget warnings
- [ ] Comprehensive test suite (Vitest + React Testing Library)
- [ ] Accessibility audit and WCAG compliance improvements
- [ ] Multi-currency portfolio tracking with live exchange rates
- [ ] Shared household budgets and split-expense tracking
- [ ] Recurring transaction automation and projection calendar

---

## Lessons Learned

**State management at scale** — Zustand's `persist` middleware handles localStorage sync cleanly, but making utility functions (like `formatCurrency`) react to state changes without hooks required using `getState()` and triggering re-renders at the app root level rather than inside individual components.

**Financial data modeling** — recurring transactions, subscriptions, and forecasting all require careful attention to date arithmetic: billing cycle variance, month boundaries, leap years, and the difference between "amount committed" and "amount spent."

**Mobile-first on real hardware** — safe-area insets on iPhone Safari behave differently from what documentation suggests. The notch and Dynamic Island area are painted by the `html` element's background, not `body`, which meant adding a solid `background-color` on `html` and a `position: fixed` background layer to cover the full viewport including insets.

**TypeScript discipline** — a strict no-`any` policy caught several real bugs during development (mismatched category union types, optional fields read without guards) that would have been silent runtime errors in JavaScript.

**Component architecture** — keeping `types → utils → store → components → pages` as a strict one-way dependency graph prevented circular imports and kept every utility function independently testable without mounting a component tree.

---

## Author

**Tanvi** — [GitHub](https://github.com/Tanvi-1432)
