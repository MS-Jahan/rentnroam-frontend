# GearUp Frontend

Next.js frontend for **GearUp** — rent sports & outdoor gear.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- TanStack Query + Zustand
- JWT auth via httpOnly cookies + middleware
- Stripe Checkout (via GearUp API payment URL)

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3000  
API: https://gearup-api.vercel.app

## Docs

- [API_INTEGRATION.md](./API_INTEGRATION.md)
- [docs/CONFUSIONS.md](./docs/CONFUSIONS.md)

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gearup.com | Admin@12345 |
| Provider | provider@gearup.com | Provider@123 |
| Customer | customer@gearup.com | Customer@123 |
