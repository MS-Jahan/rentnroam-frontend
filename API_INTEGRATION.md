# API Integration Map

**Backend:** https://gearup-api.vercel.app  
**OpenAPI:** https://gearup-api.vercel.app/api/docs

## Auth

| Frontend | Backend | Notes |
|----------|---------|-------|
| `POST /api/auth/login` (BFF) | `POST /api/auth/login` | Sets httpOnly `gearup_token` + `gearup_role` |
| `POST /api/auth/register` (BFF) | `POST /api/auth/register` | Role: CUSTOMER \| PROVIDER |
| `POST /api/auth/logout` (BFF) | — | Clears cookies |
| `GET /api/auth/me` (BFF) | `GET /api/auth/me` | Session hydrate |
| `POST /api/proxy` (BFF) | Any authenticated `/api/*` | Attaches Bearer token from cookie |

## Public

| Component / Route | Endpoint |
|-------------------|----------|
| Home featured gear | `GET /api/gear?available=true&limit=6` |
| `/gear` browse + filters | `GET /api/gear`, `GET /api/categories` |
| `/gear/[id]` | `GET /api/gear/:id` |

## Customer

| Component / Route | Endpoint |
|-------------------|----------|
| Rent CTA on detail | `POST /api/rentals` |
| Dashboard orders | `GET /api/rentals` |
| Cancel order | `PATCH /api/rentals/:id/cancel` |
| Payment history | `GET /api/payments` |
| Pay page | `POST /api/payments/create` → redirect `url` |
| Success confirm | `POST /api/payments/confirm` |
| Leave review | `POST /api/reviews` |

## Provider

| Component / Route | Endpoint |
|-------------------|----------|
| Inventory list | **Workaround:** `GET /api/gear` filtered by `providerId` (missing `GET /api/provider/gear`) |
| Add gear | `POST /api/provider/gear` |
| Edit gear | `PUT /api/provider/gear/:id` |
| Delete gear | `DELETE /api/provider/gear/:id` |
| Orders table | `GET /api/provider/orders` |
| Status actions | `PATCH /api/provider/orders/:id` |

## Admin

| Component / Route | Endpoint |
|-------------------|----------|
| Users | `GET /api/admin/users`, `PATCH /api/admin/users/:id` |
| Gear moderation | `GET /api/admin/gear` |
| Rentals moderation | `GET /api/admin/rentals` |
| Stats | Derived from `meta.total` (no `/api/admin/stats`) |

## Backend issues

See [docs/CONFUSIONS.md](./docs/CONFUSIONS.md).

### Critical gaps found

1. **`GET /api/provider/gear` → 404** on live API. Provider inventory uses public gear list filtered by provider id.
2. **Stripe `return_url`** points to API HTML (`/api/payments/success`), not frontend `/payment/success`. Frontend success page still exists and can confirm via `session_id` when reachable.
3. **No admin aggregate stats endpoint** — totals from list pagination meta.

## Test credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gearup.com | Admin@12345 |
| Provider | provider@gearup.com | Provider@123 |
| Customer | customer@gearup.com | Customer@123 |

Stripe test card: `4242 4242 4242 4242`
