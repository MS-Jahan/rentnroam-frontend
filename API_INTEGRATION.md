# API Integration

Backend: https://gearup-api.vercel.app  
Swagger: https://gearup-api.vercel.app/api/docs

Auth goes through Next.js route handlers under `/api/auth/*`. Those set an httpOnly `gearup_token` cookie. Authenticated browser calls go through `/api/proxy`, which attaches the Bearer token.

## Auth

| Frontend | Backend |
|----------|---------|
| `POST /api/auth/login` | `POST /api/auth/login` |
| `POST /api/auth/register` | `POST /api/auth/register` |
| `POST /api/auth/logout` | clears cookies locally |
| `GET /api/auth/me` | `GET /api/auth/me` |
| `POST /api/proxy` | forwards to any `/api/*` with the cookie token |

## Public

| Screen | Endpoint |
|--------|----------|
| Home featured gear | `GET /api/gear?available=true&limit=6` |
| Browse + filters | `GET /api/gear`, `GET /api/categories` |
| Gear detail | `GET /api/gear/:id` |

## Customer

| Screen | Endpoint |
|--------|----------|
| Rent from detail page | `POST /api/rentals` |
| Orders list | `GET /api/rentals` |
| Cancel order | `PATCH /api/rentals/:id/cancel` |
| Payment history | `GET /api/payments` |
| Pay page | `POST /api/payments/create` → open returned `url` |
| Payment success | `POST /api/payments/confirm` (with `sessionId`) |
| Leave review | `POST /api/reviews` |

## Provider

| Screen | Endpoint |
|--------|----------|
| Inventory | `GET /api/provider/gear` |
| Toggle availability | `PUT /api/provider/gear/:id` (`status`) |
| Add gear | `POST /api/provider/gear` |
| Edit gear | `PUT /api/provider/gear/:id` |
| Delete gear | `DELETE /api/provider/gear/:id` (blocked if rental/review history exists) |
| Orders | `GET /api/provider/orders` |
| Update status | `PATCH /api/provider/orders/:id` |

## Admin

| Screen | Endpoint |
|--------|----------|
| Users | `GET /api/admin/users`, `PATCH /api/admin/users/:id` |
| Gear moderation | `GET /api/admin/gear` |
| Rentals moderation | `GET /api/admin/rentals` |
| Dashboard counts | `meta.total` from the list endpoints above |

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gearup.com | Admin@12345 |
| Provider | provider@gearup.com | Provider@123 |
| Customer | customer@gearup.com | Customer@123 |
