# Productivity Tracker

A lightweight, minimal productivity tracking web app built with Next.js. Track daily tasks, weekly goals, and monthly objectives — a focused alternative to Notion for personal productivity.

## Features

- **Dashboard** — Overview with summary cards, streak counter, and focus trend chart
- **Daily Tracking** — Top 3 priorities, task checklist, focus score (1-10), reflection notes
- **Weekly Goals** — Up to 5 goals, habit tracking grid (Mon-Sun), weekly reflection
- **Monthly Goals** — Categorized objectives (Work/Personal/Learning), metrics dashboard
- **Calendar View** — Visual heatmap of daily completion rates
- **Analytics** — Focus trends, completion charts, streak tracking, insights
- **Search** — Find previous entries by date, task, or notes
- **PDF Export** — Export any entry as a PDF
- **Dark Mode** — Full dark/light theme support
- **Responsive** — Works on desktop and mobile

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
- **State:** Zustand
- **Charts:** Recharts
- **PDF:** jsPDF
- **Dates:** date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd productivity-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Load Sample Data

The app comes with pre-filled templates for daily, weekly, and monthly entries. Just tap any template to load it.

## Project Structure

```
productivity-tracker/
├── app/
│   ├── (dashboard)/          # Route group with shared layout
│   │   ├── layout.tsx        # Dashboard shell (sidebar + header)
│   │   ├── page.tsx          # Homepage dashboard
│   │   ├── daily/page.tsx    # Daily tracking module
│   │   ├── weekly/page.tsx   # Weekly goal sheet
│   │   ├── monthly/page.tsx  # Monthly goal sheet
│   │   ├── calendar/page.tsx # Calendar view
│   │   └── analytics/page.tsx# Analytics & charts
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── Header.tsx            # Top header with search
│   ├── Card.tsx              # Reusable card components
│   ├── TaskList.tsx          # Task checklist component
│   ├── HabitGrid.tsx         # Habit tracking grid
│   ├── FocusSlider.tsx       # Focus score slider
│   ├── ProgressBar.tsx       # Progress bar component
│   ├── CalendarView.tsx      # Calendar heatmap
│   ├── SearchModal.tsx       # Search overlay
│   └── AnalyticsChart.tsx    # Chart components
├── lib/
│   ├── store.ts              # Zustand state management
│   ├── storage.ts            # Storage abstraction layer
│   ├── utils.ts              # Utility functions
│   ├── export.ts             # PDF export functions
│   └── sample-data.ts        # Sample data generator
├── hooks/
│   ├── useStore.ts           # Store initialization hook
│   └── useSearch.ts          # Search hook
├── types/
│   └── index.ts              # TypeScript type definitions
└── public/                   # Static assets
```

## Deployment to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Option 2: CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 3: Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel auto-detects Next.js and deploys

### Environment Variables

Set these in your Vercel project settings if needed:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_NAME` | App display name | No |
| `NEXT_PUBLIC_APP_URL` | Production URL | No |
| `DATABASE_URL` | Database connection (future) | No |

## Database Migration

The app uses localStorage by default. To migrate to a database:

1. Implement the `StorageAdapter` interface in `lib/storage.ts`
2. Create a new adapter (e.g., `supabaseAdapter`, `prismaAdapter`)
3. Swap the export: `export const storage = yourNewAdapter`

The abstraction layer makes this a drop-in replacement with zero changes to components.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT
