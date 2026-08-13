# Code Review — Discrepancies & Gap Analysis (2026-08-12)

Comparison of three sources:
1. **Instructor requirements** — `docs/2026-08-12-instructor-requirements.md` (Squid Game-7 Project Update-1)
2. **Agent A instructions** — `docs/2026-08-12-agent-a-frontend-instructions.md`
3. **Current codebase** — `gearup-frontend` (Next.js 15) + `gearup-api` (Express 5 + Prisma/PostgreSQL)

Evidence format: `path:line — finding`.

---

## A. Stack discrepancies (instructions vs codebase)

| # | Instruction | Current reality | Decision needed |
|---|-------------|-----------------|-----------------|
| A1 | Agent A: "React + React Router DOM" | Next.js 15 App Router (`package.json:16`), file-based routing, RSC + `src/middleware.ts` route guards | Recommend **keeping Next.js** — it is React; PRODUCT.md:40 mandates preserving stack/deployment. A React-Router rewrite would discard working auth middleware, proxy routes, and Vercel deployment. |
| A2 | Agent A: "Shadcn UI, canvas-ui / impeccable.style" | Hand-rolled Tailwind primitives only (`src/components/ui/button.tsx`, `field.tsx`). No shadcn, no radix. | Recommend adding shadcn/ui primitives incrementally for new surfaces (dropdown-menu, select, table, tabs, dialog, skeleton, avatar, label) while keeping existing design tokens. |
| A3 | Instructor §11: Express + PostgreSQL + Prisma | Backend already matches exactly (Express 5, PostgreSQL, Prisma 6) | No action. |
| A4 | Agent A: brand "GearUp" vs PRODUCT.md:45 "Product name is **RentNRoam**… copy still says GearUp pending the rename" | UI copy says GearUp everywhere (`navbar.tsx:35`, `footer.tsx:9`, `layout.tsx:22`) | **Open question** — resolve brand before redesign. |

## B. Instructor/Agent A agreement notes

- Agent A customer sidebar (4 items) satisfies instructor §7 user minimum (4). ✔ aligned
- Agent A provider/admin sidebar lists 5 items; instructor §7 requires **6+ for admin**. Plan must add a 6th admin item (e.g., Settings or Support inbox).
- Agent A requires 3 extra pages (About, Help/Support, Privacy/Terms); instructor requires 2–3. Aligned; also instructor §10 requires a **Contact form**, so a Contact page is added too.

## C. Frontend gaps vs requirements

### C1. Navbar (instructor §2, Agent A §1)
- `src/components/navbar.tsx:12-14` — only **1 public route** (`/gear`). Required: 4+ (Home, Gear, About, Help…).
- Logged-in: only Browse Gear + Dashboard + Sign out (`navbar.tsx:51-67`). Required: 6+ routes.
- **Profile dropdown MISSING** (no avatar/menu). Required by both specs.
- Sticky + full-width background: OK (`navbar.tsx:32`).

### C2. Hero (instructor §2)
- `src/app/page.tsx:19-58` — height from padding only (`py-20 md:py-28`), not 60–70vh.
- Only CSS entrance animations (`animate-rise`); **no slider/carousel/interactive element**.
- CTAs present (`page.tsx:33-44`). ✔

### C3. Home sections (instructor §2: min 8)
- `src/app/page.tsx` has **2 sections**: Hero (19-58) + Featured gear (60-81). **6+ sections missing** (Categories, How it Works, Stats, Why-rent/Features, FAQ, CTA/Newsletter…).

### C4. Footer (instructor §2)
- `src/components/footer.tsx:15-30` — only 3 links. **Contact info MISSING. Social icons MISSING.**

### C5. Cards (instructor §3, Agent A §2)
- `src/components/gear-card.tsx:16-52` — shows image, category/brand, title, description, price. **MISSING: rating, location, explicit "View Details" button** (whole card is a link, line 12).
- Data model has **no location field at all** (schema.prisma GearItem 78-101) → backend change required.
- Gear list API returns only `_count.reviews` (gear.routes.ts:55) — **no average rating** for cards → backend change required.

### C6. Listing/Explore page (instructor §5)
- `src/app/gear/page.tsx` — filters: category/brand/min/max price/availability ✔ (2+ fields), sorting ✔ (111-117), pagination ✔ (153-158), skeletons ✔ (132-137).
- **Search bar MISSING** (no text search). Backend `GET /api/gear` also lacks a `search` param (gear.routes.ts:18-44) → backend change required.
- Grid `sm:grid-cols-2 xl:grid-cols-3` (148) → only 2 cols at `lg` (1024–1280px); requirement is 3 per row on desktop → switch to `lg:grid-cols-3`.

### C7. Details page (instructor §4)
- Gallery ✔ (`gear/[id]/page.tsx:114-141`), description ✔ (157), reviews ✔ (211-225), rent CTA with dates ✔ (163-209).
- **Specifications NOT rendered** — data exists (`lib/types.ts:61`, `specifications Json?` in schema) but unused.
- **Related items MISSING** — backend has no related-gear support; can be served by `GET /api/gear?category=<slug>&limit=5` minus current id.

### C8. Auth (instructor §6, Agent A §4)
- Login/register exist with loading states ✔ (`auth/login/page.tsx:20,81`).
- **Demo login buttons MISSING** — only a text hint (`login/page.tsx:57`). One-click Demo Customer/Provider/Admin buttons required.
- **Social login buttons MISSING** (Google/Facebook UI).
- Validation is native-attribute only (`login/page.tsx:62-78`, `register/page.tsx:71-104`); no schema-based client-side validation, no per-field error messages on register except password length (`register/page.tsx:27-30`).

### C9. Dashboards (instructor §7, Agent A §5)
- **No sidebar navigation anywhere** — all 3 dashboards use navbar + in-page buttons. Required: sidebar per role.
- **No charts; no chart library installed** (`package.json` has none). Provider revenue analytics + admin analytics pages required with real data → backend analytics endpoints also missing (see D3).
- **No editable profile page** for any role (backend `PATCH /api/profile` exists and accepts name/phone — profile.routes.ts:37).
- Customer: no overview stat cards (`customer/page.tsx:86-89`); orders/payments tables have pagination ✔ but **no filtering**.
- Provider: 3 stat cards ✔ (`provider/page.tsx:96-106`); inventory/orders tables paginated ✔, **no filtering/search**.
- Admin: 3 stat cards ✔, tabs instead of sidebar (`admin/page.tsx:89-99`); only Users tab has filters; gear/rentals tables unfiltered; **categories management UI MISSING** even though backend CRUD exists (category.routes.ts:58-120).
- Dashboards show plain "Loading…" text instead of skeleton loaders (`customer/page.tsx:94,187`, `provider/page.tsx:111`, `admin/page.tsx:125,189,238`).

### C10. Additional pages (instructor §8, Agent A §6)
- About / Contact / Help-Support / Privacy-Terms: **ALL MISSING**.

### C11. Forms (instructor §10)
- Required forms: Login ✔, Registration ✔, **Contact ✖**, Create item ✔, Edit item ✔ (but edit has no JS validation, `gear/[id]/edit/page.tsx:83-132`, unlike create), **Profile update ✖**.
- No form library; validation hand-rolled and inconsistent.

### C12. UX/content (instructor §9, §12)
- Dark mode: class-based, FOUC-guarded ✔ (`layout.tsx:26-47`, `store/theme.ts`). Contrast audit still needed for new components.
- Colors: 1 accent (`blaze`) + green secondary (`moss/fern`) + neutrals — within 3-primary limit ✔.
- `console.log` usage and production hygiene: to verify in QA pass.

## D. Backend gaps vs requirements

| # | Gap | Evidence | Change |
|---|-----|----------|--------|
| D1 | No free-text search on gear list | gear.routes.ts:18-44 (params: category, brand, min/maxPrice, available, sort, page, limit) | Add `search` param (name/brand/description contains, case-insensitive) |
| D2 | No average rating in gear list/detail | gear.routes.ts:55 only `_count.reviews`; avg exists only at review.routes.ts:104-113 | Include `avgRating` in gear list + detail responses |
| D3 | No analytics endpoints (charts must reflect real data — instructor §7) | No revenue/stats routes in src/modules | Add `GET /api/provider/analytics` (monthly revenue, orders by status, top gear) and `GET /api/admin/analytics` (users by month, rentals by month, revenue, gear by category) |
| D4 | No `location` field for gear | schema.prisma:78-101 | Add `location String?` to GearItem + migration + seed + provider create/update schemas + optional `location` search |
| D5 | No contact/support endpoint | no route in src/modules | Add ContactMessage model + `POST /api/contact` (+ admin list endpoint if support inbox scope approved) |
| D6 | No password change | profile.routes.ts:37 accepts name/phone only (validate.ts:18-21) | Add `PATCH /api/profile/password` (current + new password) |
| D7 | CORS fully open | app.ts:25 `app.use(cors())` | Whitelist frontend origins via env |
| D8 | JWT dev-secret fallback | config/index.ts:8-11 `"dev-secret-change-me"` | Fail fast in production when JWT_SECRET missing |
| D9 | Seed too thin for "real data" requirement | seed.ts: 3 users, 5 categories, **3 gear items, 0 orders/payments/reviews** | Enrich seed: ~15 gear items with real images/specs/location; backdated orders/payments/reviews across 6 months so charts/tables/testimonial-adjacent data are real (backdate script already exists: scripts/backdate-demo-timestamps.cjs) |
| D10 | Dead provider branch in rentals detail | rental.routes.ts:165-175 (router is CUSTOMER-only at :10) | Remove dead branch or expose provider order detail |
| D11 | Stock restore on RETURNED not transactional | provider.routes.ts:266-273 | Wrap in `$transaction` like rental create/cancel |

## E. Product-level conflicts (PRODUCT.md vs instructor) — RESOLVED 2026-08-12

| # | Conflict | Resolution (owner decision) |
|---|----------|---------|
| E1 | Brand: PRODUCT.md:45 says RentNRoam; instructor/Agent A say GearUp | **Keep GearUp** |
| E2 | Testimonials vs PRODUCT.md no-fabrication rule | **Seeded-user testimonials** (demo users, clearly demo data) |
| E3 | Newsletter implies collecting emails | **Real storage**: NewsletterSubscription model + POST /api/newsletter |
| E4 | Agent A says React Router DOM; codebase is Next.js | **Keep Next.js** (deviation documented in upgrade plan §0) |
