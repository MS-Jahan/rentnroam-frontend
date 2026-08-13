# GearUp Upgrade — Master Implementation Plan (2026-08-12)

**Goal:** Upgrade the existing GearUp rental platform (Next.js 15 frontend + Express/Prisma API) to fully satisfy the Squid Game-7 Project Update-1 requirements and the Agent A frontend spec: a modern, engaging public site (8+ home sections, 60–70vh interactive hero, full navbar/footer), complete listing/detail experiences, polished auth with demo/social buttons, role-based dashboards with sidebars + real charts + filterable tables, editable profiles, and 4 additional pages — with all data real end-to-end.

**Status:** FINAL — all Phase 0 decisions resolved by owner on 2026-08-12 (see §0).

**Guiding constraints**
- PRODUCT.md: preserve stack (Next.js 15 App Router, Tailwind 4, TanStack Query, Zustand), three-role model, real Stripe test checkout, nothing faked.
- Instructor §13: final submission needs live URL, repos, demo credentials — deployment is a first-class phase.
- Design: max 3 primary colors (keep `blaze` orange primary, `moss/fern` green secondary, neutrals), full light/dark support, uniform cards/spacing/radius.

---

## Phase 0 — Decisions (RESOLVED 2026-08-12)

| Q | Question | Decision |
|---|----------|----------|
| Q1 | Brand | **Keep GearUp.** No rename. |
| Q2 | Framework | **Keep Next.js 15 App Router.** Deviation from Agent A's "React Router DOM" wording is documented and justified (it is React; PRODUCT.md mandates preserving stack). |
| Q3 | Testimonials | **Seeded-user testimonials.** Home section quotes the seeded demo users (real identities in the DB), clearly presented as demo data — satisfies instructor §2 without inventing fake customers. |
| Q4 | Newsletter | **Yes, with backend storage.** New `NewsletterSubscription` model + `POST /api/newsletter` so the form is real. |
| Q5 | Location | **Yes.** Add `GearItem.location` (migration + seed + provider forms + card/listing display). |

## Phase 1 — Backend upgrades (gearup-api)

All additive; existing endpoints keep working so frontend can ship incrementally.

1. **Search**: `GET /api/gear?search=` — case-insensitive contains on name/brand/description (`gear.routes.ts`, `validate.ts`).
2. **Ratings**: include `avgRating` (+ `reviewCount`) in `GET /api/gear` list items and `GET /api/gear/:id` (Prisma aggregate subquery or groupBy join).
3. **Location**: `GearItem.location String?` migration; add to provider create/update zod schemas; return in all gear payloads; optional `?location=` filter.
4. **Analytics**:
   - `GET /api/provider/analytics` → monthly revenue (last 6 months), orders by status, top-revenue gear, totals.
   - `GET /api/admin/analytics` → users by month, rentals by month, revenue by month, gear by category, totals.
   - Source: existing Payment/RentalOrder/Category tables; return chart-ready arrays `{label, value}`.
5. **Contact**: `ContactMessage` model (name, email, subject, message, createdAt) + `POST /api/contact` (zod-validated, public). Optional: `GET /api/admin/messages` for admin support inbox.
6. **Newsletter** (Q4): `NewsletterSubscription` model (email unique, createdAt) + `POST /api/newsletter` (zod email, upsert, idempotent success).
7. **Password change**: `PATCH /api/profile/password` (verify current, bcrypt new, min 8 + complexity).
8. **Security hardening**: CORS origin whitelist from env (`app.ts:25`); fail-fast when `JWT_SECRET` missing in production (config/index.ts).
9. **Seed enrichment** (instructor: realistic data, charts with real data):
   - 12–18 gear items across all 5 categories with real Unsplash images, full `specifications` JSON, locations, multiple images each.
   - 2–3 extra provider accounts + customer accounts so marketplace looks real (demo logins documented).
   - Backdated orders/payments/reviews spread over 6 months (reuse `scripts/backdate-demo-timestamps.cjs`) → charts, tables, review sections populated.
   - Keep idempotent upsert style; refresh README demo-credentials table.
   - Seeded reviews double as the source for the home testimonials section (Q3) — attribute to seeded users.
10. **Minor fixes**: transactional stock restore on RETURNED (provider.routes.ts:266-273); remove dead provider branch in `GET /api/rentals/:id` or expose properly.
11. **Docs**: regenerate swagger; update `demo/` scripts for new endpoints.

**Verify:** `npm run build`, `bash scripts/e2e-test.sh`, run demo scripts against local server.

## Phase 2 — Frontend foundation

1. **UI primitives** (shadcn-style, matching existing tokens in `globals.css`): `card`, `dropdown-menu` (radix), `select`, `tabs`, `dialog`, `table`, `skeleton`, `avatar`, `label`, `textarea`, `badge`. Keep `button`/`field` API-compatible.
2. **Form standardization**: add `react-hook-form` + `zod` + `@hookform/resolvers`; shared `<FormField>` wiring label/input/error (accessible `htmlFor`/`aria-invalid`). Reuse across all 6 required forms.
3. **Charts**: add `recharts`; shared `<ChartCard>` with dark-mode-aware palette.
4. **Skeletons**: table/chart/stat skeletons; replace every "Loading…" text.
5. **Design tokens QA**: verify ≤3 primaries, unify radius/spacing scale, dark-contrast pass.

## Phase 3 — Public site

1. **Navbar rebuild**: public links Home, Browse Gear, About, Help (4+); logged-in adds Dashboard, role links, profile dropdown (avatar → Profile, Dashboard, Theme, Logout) = 6+; sticky, full-width bg, mobile menu preserved.
2. **Hero**: `min-h-[60vh] max-h-[70vh]`, interactive element (auto-advancing gear category slider or animated stats ticker), primary + secondary CTA, clear scroll cue to next section.
3. **Home sections (9)**: Hero → Featured Gear (live API) → Categories grid (live `/api/categories` with counts) → How it Works (3–4 steps) → Stats band (live counts) → Why rent with us (features) → Testimonials (seeded demo users, Q3) → FAQ (accordion) → Newsletter (live `POST /api/newsletter`, Q4) + closing CTA banner (become a provider).
4. **Footer**: 4 columns (brand+blurb, Explore links, Company links, Contact info) + social icons + legal line; all links route to real pages.
5. **Listing page**: add debounced **search bar** (uses Phase 1 `search`), keep filters/sort/pagination, grid `lg:grid-cols-3`, card upgrade: rating stars (avgRating), location badge, explicit **View Details** button, uniform heights.
6. **Details page**: render **specifications** table, add **Related items** row (same category, exclude current), reviews with avg summary, keep gallery + rent form.

## Phase 4 — Auth upgrade

1. Login/register rebuilt on RHF+zod: per-field errors, success/error toasts, loading buttons.
2. **Demo login buttons**: Demo Customer / Demo Provider / Demo Admin — one click fills + submits credentials.
3. **Social buttons**: Google + Facebook UI; on click show "Social login not enabled in demo" toast (honest, not faked) unless OAuth scope is added later.
4. Keep `?next=` redirect, middleware guards unchanged.

## Phase 5 — Dashboards (role-based)

1. **Shared dashboard layout**: collapsible sidebar (icons+labels), top bar with profile dropdown (Profile settings, Logout), mobile drawer; role-specific nav config.
2. **Customer** (4 items): Overview (stat cards: active rentals, total spent, pending payments, reviews given + recent orders), My Rentals (status filter + search), Payment History (status filter), Profile Settings (RHF form → `PATCH /api/profile`, password change → Phase 1 endpoint).
3. **Provider** (5–6 items): Overview (stats + revenue line chart), Manage Gear (search/status filter, add/edit forms with specs editor + multiple image URLs + location), Manage Orders (status filter), Revenue Analytics (monthly revenue bar/line, orders-by-status pie, top gear table), Categories (read-only catalog view), Profile Settings.
4. **Admin** (6+ items): Overview (stats + users/rentals line charts), Manage Users (role/status filters), Manage Gear (category filter/search), Manage Rentals (status filter), Categories CRUD (uses existing backend endpoints), Analytics (gear-by-category pie, revenue chart), Settings/Support (profile + contact messages if Q-scope approved).
5. All tables: pagination + filtering + skeletons; empty states with real copy.

## Phase 6 — Additional pages

1. **About** — mission, how it works, team-of-roles, CTA.
2. **Help/Support** — FAQ + contact form (`POST /api/contact`).
3. **Contact** — contact form + info (can merge with Help if preferred).
4. **Privacy & Terms** — real rental-marketplace copy, no lorem ipsum.

## Phase 7 — QA, docs, deployment

1. Responsive pass (mobile/tablet/desktop) on every new surface; dark-mode contrast pass.
2. `npm run lint` + `npm run build` clean both repos; remove stray console logs.
3. Run backend `demo/run-all.sh` + frontend manual walkthrough of full rental loop (browse → rent → provider confirm → Stripe pay → pickup → return → review) for all 3 demo roles.
4. Update READMEs, `API_INTEGRATION.md`, docs/ with final state; record demo credentials (instructor §13).
5. Deploy: API to Vercel (migrate DB schema first), frontend to Vercel; smoke-test live URLs.

---

## Execution order & dependencies

```
Phase 0 (decisions) → Phase 1 (backend) → Phase 2 (foundation)
Phase 3–6 (frontend, mostly parallel after 2) → Phase 7 (QA/deploy)
```

Estimated effort: backend ~1 session, foundation ~1, public site ~1–2, auth ~0.5, dashboards ~2, extra pages ~0.5, QA/deploy ~1.

## Risks

- Seed enrichment touches demo data used by demo scripts/e2e — re-run `demo/run-all.sh` after seeding.
- Prisma migration on deployed Neon/Postgres DB — run `prisma migrate deploy` carefully during Phase 7.
- shadcn/radix additions must respect existing Tailwind v4 token setup (`@theme inline` in globals.css).

## Open items tracker

- [x] Q1 brand → GearUp; Q2 stack → Next.js; Q3 testimonials → seeded users; Q4 newsletter → backend storage; Q5 location → add (owner sign-off 2026-08-12)
- [ ] Owner approval of this master plan
- [ ] Per-phase detailed task breakdowns (written as each phase starts)
