# AirConnect Admin

Admin dashboard for managing AirConnect eSIM operations.

Live: https://air-connect-admin.vercel.app

## Features

- Admin sign-in with Supabase-backed access checks
- Dashboard for paid revenue, recent orders, and top-selling plans
- eSIM plan management: create, edit, hide, and reactivate plans
- Revenue reports by date range, payment status, plan, and coverage
- Order search, filters, pagination, and revenue eligibility labels
- English/Vietnamese UI language switch with local persistence

## Stack

- React 19
- Vite 6
- TypeScript
- Tailwind CSS
- Supabase
- React Router
- ApexCharts

## Environment

Create a local `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Routing Note

The admin app uses hash routing (`/#/plans`) so static hosting refreshes do not 404.
