# RentNRoam API Integration Guide

**Backend API:** https://rentnroam-api.vercel.app  
**Swagger API Docs:** https://rentnroam-api.vercel.app/api/docs  
**Frontend Repo:** https://github.com/MS-Jahan/rentnroam-frontend  
**Backend Repo:** https://github.com/MS-Jahan/rentnroam-api  

Authentication goes through Next.js route handlers under `/api/auth/*`. Those set an httpOnly `gearup_token` cookie (and role cookie `gearup_role`). Authenticated browser calls go through `/api/proxy`, which attaches the Bearer JWT token automatically.

---

## 1. Authentication Endpoints

| Frontend Route | Backend Endpoint | Method | Description |
|----------------|------------------|--------|-------------|
| `/api/auth/login` | `/api/auth/login` | POST | Login with email/password, sets httpOnly cookie |
| `/api/auth/register` | `/api/auth/register` | POST | Register customer or provider account |
| `/api/auth/logout` | — | POST | Clears auth cookies locally |
| `/api/auth/me` | `/api/auth/me` | GET | Retrieve currently logged-in user profile |
| `/api/auth/callback` | — | GET | OAuth return handler: sets auth cookies from `token`, `role`, `next` query params |
| `/api/proxy` | `/api/*` | POST | Proxies authenticated client requests with Bearer JWT |

### OAuth (backend-initiated)

Social login starts on the backend; after provider auth the backend redirects to the frontend callback with credentials in the query string.

| Backend Endpoint | Method | Description |
|------------------|--------|-------------|
| `/api/auth/google` | GET | Start Google OAuth (`next`, `role` optional query params) |
| `/api/auth/google/callback` | GET | Google OAuth provider callback (backend handles token exchange) |
| `/api/auth/facebook` | GET | Start Facebook OAuth (`next`, `role` optional query params) |
| `/api/auth/facebook/callback` | GET | Facebook OAuth provider callback (backend handles token exchange) |

Frontend flow: `startOAuth('google'|'facebook')` → backend OAuth URL → provider → backend callback → redirect to `/api/auth/callback?token=...&role=...&next=...` → cookies set → dashboard.

---

## 2. Public & Guest Endpoints

| Feature / Screen | Endpoint | Method | Description |
|------------------|----------|--------|-------------|
| Home Featured Gear | `/api/gear?available=true&limit=6` | GET | List top available gear items for home page |
| Gear Catalog | `/api/gear` | GET | Browse gear with search, category, brand, rating, location, and sorting |
| Category List | `/api/categories` | GET | List all sport categories |
| Gear Detail | `/api/gear/:id` | GET | Get gear specs, photos, location, rating, and reviews |
| Contact Form | `/api/contact` | POST | Submit support request (name, email, subject, message) |
| Newsletter | `/api/newsletter` | POST | Subscribe email to trail newsletter |

---

## 3. Customer Endpoints

| Feature / Screen | Endpoint | Method | Description |
|------------------|----------|--------|-------------|
| Create Booking | `/api/rentals` | POST | Place rental order for gear item and dates |
| Order History | `/api/rentals` | GET | List customer's orders with status filtering & pagination |
| Cancel Order | `/api/rentals/:id/cancel` | PATCH | Cancel PLACED or CONFIRMED order |
| Payment History | `/api/payments` | GET | List completed/pending payments |
| Stripe Checkout | `/api/payments/create` | POST | Create Stripe Checkout session (returns pay `url`) |
| Confirm Payment | `/api/payments/confirm` | POST | Fallback manual confirmation with `sessionId` |
| Leave Review | `/api/reviews` | POST | Submit rating (1–5) and comment after return |
| Change Password | `/api/profile/password` | PATCH | Update account password (bcrypt cost 10) |

---

## 4. Provider Endpoints

| Feature / Screen | Endpoint | Method | Description |
|------------------|----------|--------|-------------|
| Analytics | `/api/provider/analytics` | GET | Monthly revenue (6 mo), orders by status, top gear, overview totals |
| Inventory List | `/api/provider/gear` | GET | List owned gear listings with pagination |
| Create Gear | `/api/provider/gear` | POST | Add new gear item with specs, location, and photos |
| Update Gear | `/api/provider/gear/:id` | PUT | Edit gear details or status (AVAILABLE/MAINTENANCE) |
| Delete Gear | `/api/provider/gear/:id` | DELETE | Remove gear (blocked if order history exists) |
| Incoming Orders | `/api/provider/orders` | GET | Manage renter bookings |
| Update Order Status | `/api/provider/orders/:id` | PATCH | Confirm, mark picked up, mark returned, or cancel |

---

## 5. Admin Endpoints

| Feature / Screen | Endpoint | Method | Description |
|------------------|----------|--------|-------------|
| Platform Analytics | `/api/admin/analytics` | GET | Platform-wide user growth, rental trends, revenue, and category breakdown |
| Manage Users | `/api/admin/users` | GET / PATCH | List users, suspend or activate accounts |
| Moderation: Gear | `/api/admin/gear` | GET | List all platform gear listings |
| Moderation: Orders | `/api/admin/rentals` | GET | List all platform rental orders |
| Manage Categories | `/api/categories` | POST/PATCH/DELETE | Add, update, or remove empty sport categories |

---

## 6. Demo Credentials (Instructor §13 Requirement)

See **[DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md)** — identical in frontend and API repos, matches `prisma/seed.ts`.

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@gearup.com` | `Admin@12345` | Platform moderation, global analytics, user management |
| **Provider** | `provider@gearup.com` | `Provider@123` | Adventure Gear Shop (primary demo provider) |
| **Provider** | `summit@gearup.com` | `Summit@123` | Summit Rentals |
| **Provider** | `wave@gearup.com` | `Wave@123` | Wave & Trail Co |
| **Customer** | `customer@gearup.com` | `Customer@123` | Rahim Khan (primary demo customer) |
| **Customer** | `alex@gearup.com` | `Alex@123` | Alex Rahman |
| **Customer** | `sara@gearup.com` | `Sara@123` | Sara Islam |
