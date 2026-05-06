# PocketPlan — Personal Finance Dashboard

A full-featured personal budgeting web app built as a portfolio project. PocketPlan helps you track income and expenses, manage monthly budgets, set savings goals, and visualize your finances — all in the browser with no backend required.

> **Live Demo:** _[https://pocket-plan-plum.vercel.app]_
>
> **Screenshots:** _[Add screenshots after deployment]_

---

## Features

- **Transaction tracking** — add, edit, and delete income and expenses with categories and notes
- **Category budgets** — set monthly spending limits per category with real-time progress tracking
- **Savings goals** — create goals, add contributions, and track progress toward a deadline
- **Dashboard** — monthly summary cards, category spending chart, monthly trend chart, and budget overview
- **Demo financial sync** — simulates connecting bank accounts, credit cards, and investment accounts (mock data only)
- **Investment portfolio** — view holdings, allocation chart, total gain/loss, and overall return
- **Net worth estimate** — cash + investments − credit card debt
- **Load demo data** — one-click sample data to explore the app without manual entry
- **Local persistence** — all data saved to `localStorage`, survives page refresh
- **Responsive layout** — sidebar navigation on desktop, hamburger menu on mobile

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI and strict type safety |
| Vite 8 | Build tool and dev server |
| Tailwind CSS v4 | Utility-first styling |
| Zustand 5 | Global state management with `persist` middleware |
| Recharts | Bar chart, pie/donut chart, custom tooltips |
| uuid | Unique IDs for all entities |
| localStorage | Client-side data persistence (no backend) |

---

## Getting Started

### Prerequisites

- Node.js v20 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Tanvi-1432/PocketPlan.git
cd PocketPlan

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

---

## Usage

1. **Dashboard** — your starting point. Click **Load demo data** to populate the app with realistic sample transactions, budgets, and goals instantly.
2. **Transactions** — add your income and expenses. Filter by month, type, or category.
3. **Budgets** — set monthly spending limits per category. The app shows how much you've spent vs your limit.
4. **Goals** — create savings goals with a target amount and deadline. Add contributions over time.
5. **Accounts** — click **Simulate Account Sync** to load mock bank, credit card, and investment account data.
6. **Investments** — view your simulated portfolio holdings, allocation breakdown, and total gain/loss.

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable primitives: Button, Card, Input, Select, Modal, ProgressBar
│   ├── dashboard/       # Dashboard-specific components: SummaryCard, charts, recent activity
│   ├── transactions/    # TransactionForm, TransactionList, TransactionItem, TransactionFilters
│   ├── budgets/         # BudgetForm, BudgetCard
│   ├── goals/           # GoalForm, GoalCard, ContributionForm
│   ├── accounts/        # AccountCard, SyncButton
│   ├── investments/     # AllocationChart, HoldingsTable
│   └── Layout.tsx       # App shell with sidebar navigation
├── pages/               # Dashboard, Transactions, Budgets, Goals, Accounts, Investments
├── store/               # Zustand slices: transactions, budgets, goals, accounts, investments
├── types/               # All TypeScript interfaces and union types
├── utils/               # Pure functions: currency, date, transaction math, budget progress, investments
├── hooks/               # useDemoData — orchestrates loading and clearing demo data
└── constants/           # Category lists, colors, demo data builders
```

**Architecture rule:** `types` → `utils` → `store` → `components` → `pages`. Lower layers never import from higher ones.

---

## What I Learned

- Structuring a mid-size React app with a clean separation of concerns
- Using Zustand with the `persist` middleware for zero-boilerplate localStorage sync
- Writing strict TypeScript with no `any` — proper union types, `Omit`, `Partial`, discriminated unions
- Building reusable, accessible UI components from scratch with Tailwind CSS v4
- Integrating Recharts with custom tooltips and responsive containers
- Deriving all computed data with `useMemo` to avoid unnecessary re-renders
- Simulating a financial data sync flow (inspired by Plaid/Akoya) without a real API

---

## Demo Financial Sync

PocketPlan includes a simulated financial account sync feature. It mimics how a real personal finance app would connect to bank, credit card, and investment accounts using a permissioned financial data API. For safety and portfolio demonstration purposes, all account data, transactions, and holdings are mock data — no real credentials are ever used.

A production version of this feature could integrate with services like **Plaid**, **Akoya**, or **MX Technologies** to pull real transaction and balance data with user consent.

---

## Future Improvements

- [ ] Dark mode
- [ ] Export transactions to CSV
- [ ] Recurring transaction support
- [ ] Multi-month budget comparison chart
- [ ] Push notifications for budget warnings
- [ ] Real Plaid API integration (with secure backend)
- [ ] User authentication and cloud sync

---

## Deployment

This app is a static SPA and deploys to Vercel with zero configuration.

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel auto-detects Vite — default settings work
4. Click **Deploy**

A `vercel.json` is included to handle client-side routing correctly.

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

---

## Author

**Tanvi** — [GitHub](https://github.com/Tanvi-1432)

---

_Built with React, TypeScript, Tailwind CSS, Zustand, and Recharts._
