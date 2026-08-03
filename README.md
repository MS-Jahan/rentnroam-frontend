# GearUp Frontend

Next.js app for renting sports and outdoor gear. Talks to the GearUp API for auth, listings, rentals, and Stripe payments.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- TanStack Query for server state, Zustand for the logged-in user
- JWT in httpOnly cookies, with middleware on dashboard routes
- Stripe Checkout via the API payment URL

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

- App: http://localhost:3000
- API: https://gearup-api.vercel.app

Set `NEXT_PUBLIC_API_URL` in `.env.local` if you point at a different backend.

## Useful files

- [API_INTEGRATION.md](./API_INTEGRATION.md) - which screens call which endpoints

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gearup.com | Admin@12345 |
| Provider | provider@gearup.com | Provider@123 |
| Customer | customer@gearup.com | Customer@123 |

Stripe test card: `4242 4242 4242 4242` (any future expiry / CVC)
