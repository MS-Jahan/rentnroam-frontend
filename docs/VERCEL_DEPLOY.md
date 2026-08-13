# RentNRoam — Deploy to Vercel Guide

Deploy **backend API first**, then **frontend**. Frontend auth, payments, contact, and newsletter all call the API.

| Repo | GitHub | Suggested Vercel project name |
|------|--------|--------------------------------|
| API | https://github.com/MS-Jahan/rentnroam-api | `rentnroam-api` |
| Frontend | https://github.com/MS-Jahan/rentnroam-frontend | `rentnroam-frontend` |

---

## Important: do not reuse the old GearUp Vercel projects

The legacy deployments are **out of scope** for this submission:

| Old (ignore) | Why |
|--------------|-----|
| `gearup-api.vercel.app` | Pre-upgrade API — missing contact, newsletter, OAuth, enriched seed |
| `gearup-frontend-kappa.vercel.app` | Pre-upgrade frontend — missing `/about`, `/help`, `/contact`, dashboards |

**Create two new Vercel projects** linked to `MS-Jahan/rentnroam-api` and `MS-Jahan/rentnroam-frontend`. Do not point the new repos at the old GearUp projects or redeploy over them.

After first deploy, Vercel assigns URLs like:

- `https://rentnroam-api.vercel.app` (or similar — copy from dashboard)
- `https://rentnroam-frontend.vercel.app` (or similar)

Use those URLs everywhere below as `YOUR-API` and `YOUR-FRONTEND`. Update README submission tables when known.

---

## 0. Prerequisites

1. **Vercel account** — https://vercel.com
2. **PostgreSQL** — Neon recommended (Vercel Marketplace → Storage)
3. **Stripe test keys** — https://dashboard.stripe.com/test/apikeys
4. **OAuth apps** (optional, for Google/Facebook login):
   - Google Cloud Console → OAuth 2.0 Client
   - Meta for Developers → Facebook Login app

---

## 1. Database setup (before API deploy)

Use **Neon** (new database — not the old GearUp DB unless you intentionally migrate it). You need two connection strings:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | **Pooled** URL for runtime (`-pooler` host, append `?pgbouncer=true&connection_limit=1` for Neon) |
| `DIRECT_URL` | **Direct** URL for migrations only (no pooler) |

### Apply migrations + seed (run locally once)

```bash
cd rentnroam-api

export DIRECT_URL="postgresql://USER:PASS@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
export DATABASE_URL="$DIRECT_URL"

npx prisma migrate deploy
npm run db:seed
```

Migrations in repo (apply in order):

1. `20260708100000_init`
2. `20260812090000_add_gear_location`
3. `20260812120000_add_contact_and_newsletter`
4. `20260813100000_add_oauth_fields`

Optional — backdate demo timestamps for video recording:

```bash
DIRECT_URL="postgresql://..." bash demo/backdate-db.sh
```

---

## 2. Backend API — new Vercel project

### 2.1 Create project (Dashboard)

1. Vercel → **Add New → Project**
2. Import **`MS-Jahan/rentnroam-api`** (not `gearup-api`)
3. **Project name:** `rentnroam-api` (or your choice — becomes part of the URL)
4. **Framework preset:** Other (`vercel.json` drives the build)
5. **Root directory:** `/`
6. **Build command:** `npm run build` (optional — serverless uses `src/server.ts` directly)
7. **Install command:** `npm install` (`postinstall` runs `prisma generate` + swagger)

`vercel.json` in repo:

```json
{
  "builds": [{ "src": "src/server.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/server.ts" }]
}
```

### 2.2 Environment variables (Production + Preview)

Replace placeholders with your **new** API URL after first deploy.

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Neon pooled URL |
| `DIRECT_URL` | Neon direct URL |
| `JWT_SECRET` | Long random string (required in production) |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `APP_URL` | `https://rentnroam-api.vercel.app` |
| `FRONTEND_URL` | `https://rentnroam-frontend.vercel.app` (set after frontend deploy) |
| `CORS_ORIGINS` | `https://rentnroam-frontend.vercel.app,http://localhost:3000` |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (step 2.4) |
| `GOOGLE_CLIENT_ID` | optional |
| `GOOGLE_CLIENT_SECRET` | optional |
| `GOOGLE_CALLBACK_URL` | `https://rentnroam-api.vercel.app/api/auth/google/callback` |
| `FACEBOOK_CLIENT_ID` | optional |
| `FACEBOOK_CLIENT_SECRET` | optional |
| `FACEBOOK_CALLBACK_URL` | `https://rentnroam-api.vercel.app/api/auth/facebook/callback` |

8. **Deploy** → copy the **Production URL** from Vercel dashboard

### 2.3 CLI alternative

```bash
cd rentnroam-api
vercel login
vercel link    # create NEW project — do not link to gearup-api
vercel env add DATABASE_URL production
# ... add each variable
vercel --prod
```

### 2.4 Verify API

```bash
export API=https://rentnroam-api.vercel.app   # your actual URL

curl "$API/health"
# → {"success":true,"message":"RentNRoam API is running"}

curl -I "$API/api/docs"
# → 200

curl -X POST "$API/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","subject":"Hi","message":"Hello"}'
# → 201 (not 404)
```

Root response must say **RentNRoam API**, not GearUp.

### 2.5 Stripe webhook (new endpoint URL)

1. [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks) → **Add endpoint**
2. **URL:** `https://YOUR-API.vercel.app/api/payments/webhook`  
   (not the old `gearup-api` webhook URL)
3. **Events:** `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy signing secret → Vercel `STRIPE_WEBHOOK_SECRET`
5. Redeploy API

### 2.6 OAuth redirect URIs (new app URLs)

Register in Google/Facebook consoles — **new** callback URLs on your **new** API domain:

| Provider | Callback |
|----------|----------|
| Google | `https://YOUR-API.vercel.app/api/auth/google/callback` |
| Facebook | `https://YOUR-API.vercel.app/api/auth/facebook/callback` |

---

## 3. Frontend — new Vercel project

Deploy **after** API is live.

### 3.1 Create project (Dashboard)

1. Vercel → **Add New → Project**
2. Import **`MS-Jahan/rentnroam-frontend`** (not `gearup-frontend`)
3. **Project name:** `rentnroam-frontend`
4. **Framework preset:** Next.js (auto-detected)
5. **Build command:** `npm run build`
6. **Environment variables:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-FRONTEND.vercel.app` (optional — footer live link) |

7. **Deploy** → copy production URL

### 3.2 CLI alternative

```bash
cd rentnroam-frontend
vercel link    # NEW project — not gearup-frontend
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel --prod
```

### 3.3 Final API env update

In **rentnroam-api** Vercel project, set:

```
FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
CORS_ORIGINS=https://YOUR-FRONTEND.vercel.app,http://localhost:3000
```

Redeploy API (OAuth redirects + Stripe success URLs depend on this).

---

## 4. Post-deploy checklist

| Check | Expected |
|-------|----------|
| API root | `"RentNRoam API"` message |
| Swagger | `/api/docs` loads |
| Frontend pages | `/`, `/about`, `/help`, `/contact` — all 200 |
| Gear catalog | `/gear` — 15 seeded items with location/ratings |
| Demo login | Customer / Provider / Admin one-click |
| Customer chart | Overview → Monthly Spending bar |
| Contact + newsletter | Forms return success |
| Stripe | `4242 4242 4242 4242` completes payment |
| OAuth | Google/Facebook if env configured |

### Demo credentials (seed)

See **[DEMO_CREDENTIALS.md](../DEMO_CREDENTIALS.md)** in both repos.

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gearup.com` | `Admin@12345` |
| Provider | `provider@gearup.com` | `Provider@123` |
| Provider | `summit@gearup.com` | `Summit@123` |
| Provider | `wave@gearup.com` | `Wave@123` |
| Customer | `customer@gearup.com` | `Customer@123` |
| Customer | `alex@gearup.com` | `Alex@123` |
| Customer | `sara@gearup.com` | `Sara@123` |

---

## 5. Deploy order

```
1. New Neon database
2. prisma migrate deploy + db:seed
3. NEW Vercel project: rentnroam-api (+ env vars)
4. Stripe webhook → new API URL → redeploy API
5. NEW Vercel project: rentnroam-frontend (NEXT_PUBLIC_API_URL)
6. Update API FRONTEND_URL + CORS_ORIGINS → redeploy API
7. OAuth consoles → new callback URLs
8. Update README §13 URLs in both repos
9. Full browser walkthrough (3 roles)
```

---

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Still see GearUp on API `/` | Wrong Vercel project — deploy `rentnroam-api` repo, not `gearup-api` |
| Frontend 404 on `/about` | Wrong project — deploy `rentnroam-frontend`, not `gearup-frontend` |
| CORS errors | Add **new** frontend URL to `CORS_ORIGINS`, redeploy API |
| `NEXT_PUBLIC_API_URL` ignored | Redeploy frontend after env change |
| OAuth redirect mismatch | Callback URLs must match **new** API domain |
| Payments stay PENDING | Webhook on **new** API URL + `STRIPE_WEBHOOK_SECRET` |
| Empty gear list | Seed not run on **new** Neon DB |

---

## 7. Ongoing deploys

```bash
git push origin main
```

Each repo auto-builds on Vercel when Git integration is enabled.

Run `npx prisma migrate deploy` locally against `DIRECT_URL` when new migrations land — not on Vercel build.

---

## 8. Instructor §13 — fill after deploy

| Field | Your new URL |
|-------|----------------|
| Live Website | https://rentnroam-frontend.vercel.app |
| Backend API | https://rentnroam-api.vercel.app |
| Swagger | https://rentnroam-api.vercel.app/api/docs |
| Frontend repo | https://github.com/MS-Jahan/rentnroam-frontend |
| Backend repo | https://github.com/MS-Jahan/rentnroam-api |

Do **not** submit the old `gearup-*` URLs.
