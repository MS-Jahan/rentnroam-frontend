# Handoff Guide — Upgrade Session Pickup (2026-08-12)

> UPDATE 2026-08-12 (second review pass): Frontend F1–F5 now implemented by another agent (uncommitted). Outstanding fixes are listed in §7 below. Status table above is stale otherwise — see `docs/2026-08-12-task-progress.md` for the verification pass.

For: any AI agent or engineer resuming this work.
Read this FIRST, then `docs/2026-08-12-upgrade-plan.md` (master plan), `docs/2026-08-12-code-review-discrepancies.md` (gap analysis), `docs/2026-08-12-task-progress.md` (per-task detail).

---

## 1. Repos & branches

| Repo | Path | Branch | State |
|------|------|--------|-------|
| Backend | `~/projects/gearup-api` | `feat/upgrade-session` | All B1–B3 work in WORKING TREE (uncommitted), except original B1 commit `4b10af5` (made before no-commit rule) |
| Frontend | `~/projects/gearup-frontend` | `feat/upgrade-session` | No code changes yet; only `docs/` added (untracked) |

**Rules from owner:**
- **DO NOT commit or push** anything. Leave all changes in the working tree.
- No browser testing (skipped per owner). Docker-based API testing was attempted but is NOT possible here (docker socket permission denied, no sudo, no local postgres) — runtime DB verification is deferred to deploy/QA phase elsewhere.
- Never touch the production/Neon DB. Migrations are hand-written and UNAPPLIED.

## 2. Current status snapshot

| Task | Status | Notes |
|------|--------|-------|
| B1 Gear list enhancements | ✅ Done (commit `4b10af5` + uncommitted review fixes) | spec ✅ quality ✅, fixes applied & verified |
| B2 New endpoints (analytics/contact/newsletter/password) | ✅ Done | spec ✅ quality ✅ ("approved with fixes"), fixes applied & verified |
| B3 Security (CORS/JWT) + seed enrichment | ✅ Done | spec APPROVED ✅, quality APPROVED_WITH_FIXES ✅, fixes applied & verified |
| F1 Frontend foundation | ✅ Done | primitives, RHF+Zod FormField, Recharts ChartCard, composite skeletons |
| F2 Public site | ✅ Done | Navbar, Footer, 9 Home sections, Gear listing w/ search, Gear details w/ specs |
| F3 Auth upgrade | ✅ Done | Login & Register w/ RHF+Zod, One-Click Demo buttons (Customer/Provider/Admin), Social toasts |
| F4 Dashboards | ✅ Done | Customer/Provider/Admin role dashboards with live analytics charts & fulfillment actions |
| F5 Extra pages | ✅ Done | About, Help & FAQ, Contact (submits to /api/contact), Privacy Policy, Terms of Rental |
| Q QA + deploy | ⏳ Pending | Needs live DB & Vercel deployment environment |

## 3. What is implemented (backend, uncommitted except noted)

### B1 — `4b10af5` + working-tree fixes (`src/modules/gear/gear.routes.ts`, `src/modules/provider/provider.routes.ts`, `src/modules/rentals/rental.routes.ts`, `src/middleware/validate.ts`, `prisma/schema.prisma`, `prisma/migrations/20260812090000_add_gear_location/`)
- `GET /api/gear?search=` — case-insensitive OR across name/brand/description, AND'd with existing filters.
- `avgRating` (1 decimal via shared `roundRating` in `src/utils/helpers.ts`) + `reviewCount` on list items (groupBy per page, no N+1) and detail (aggregate).
- `GearItem.location String?` — migration `20260812090000_add_gear_location` (hand-written), zod create/update (`trim().min(1).nullable().optional()` so explicit null clears), list filter `?location=`.
- Fixes: RETURNED stock restore + status update in ONE `$transaction`; dead providerId branch removed from CUSTOMER-only `GET /api/rentals/:id`.

### B2 — `src/modules/provider/provider.routes.ts`, `src/modules/admin/admin.routes.ts`, `src/modules/contact/contact.routes.ts` (new), `src/modules/newsletter/newsletter.routes.ts` (new), `src/modules/profile/profile.routes.ts`, `src/utils/helpers.ts` (getLastMonths, monthLabel, roundRating), `prisma/migrations/20260812120000_add_contact_and_newsletter/`
- `GET /api/provider/analytics`: monthlyRevenue (6 mo, COMPLETED only, cents-rounded, 0-filled, oldest first), ordersByStatus (zero-filled via enum), topGear (top 5 by item-value over PAID non-cancelled orders — semantics documented in swagger), totals (revenue/orders/activeListings/avgRating).
- `GET /api/admin/analytics`: usersByMonth, rentalsByMonth, revenueByMonth (cents-rounded), gearByCategory, totals.
- `POST /api/contact` (public, zod 2/3/10 + email, 201). No admin read API (intentional).
- `POST /api/newsletter` (public, email normalized `.trim().toLowerCase()`, upsert idempotent).
- `PATCH /api/profile/password` (bcrypt.compare current → 400, cost 10, regex letter+digit, empty response).
- Both new models mounted in `src/app.ts`; swagger regenerated (33 paths).

### B3 — `src/app.ts`, `src/config/index.ts`, `prisma/seed.ts`, `.env.example`, `README.md` (REVIEW PENDING)
- CORS whitelist: `CORS_ORIGINS` env, defaults `http://localhost:3000,https://gearup-frontend-kappa.vercel.app`, `credentials: true`, trim/filter parsing.
- JWT: throws at startup in production when `JWT_SECRET` missing or equals `dev-secret-change-me`; dev keeps fallback.
- Seed (idempotent, deterministic): +2 providers (`summit@gearup.com/Summit@123`, `wave@gearup.com/Wave@123`), +2 customers (`alex@gearup.com/Alex@123`, `sara@gearup.com/Sara@123`); +12 gear (15 total) across 5 categories/3 providers incl. 1 MAINTENANCE + 1 UNAVAILABLE, 3 Unsplash images each, specifications JSON, locations; 12 orders `ord_demo_001..012` (Feb–Aug 2026, all 6 statuses, totals pricePerDay×qty×days); 11 payments `pi_demo_*` (COMPLETED in-window, 1 FAILED, 1 PENDING); 7 reviews (3–5 stars, unique rentalOrderId).
- Existing 3 accounts/5 categories/3 gear preserved (demo scripts depend on them).

**Verification so far:** `npx tsc --noEmit` ✅, `npm run build` ✅ (swagger regenerates identically), seed ts compile-verified separately, JWT/CORS runtime-verified with ephemeral server (no DB needed).

## 4. How to resume — next steps

### Step 1: Finish B3 review (starts the review convention)
- **Spec reviewer first, then code quality reviewer** (fresh subagents; give each the full Task B3 spec + "do not trust the report" instruction). Review items in `docs/2026-08-12-task-progress.md` B3 section + section-3 table above.
- Specific B3 checks: CORS default list exactness + env parsing; JWT throw timing; seed idempotency (upsert keys), unique-key collisions (Review.rentalOrderId, Payment.rentalOrderId, User.email), date consistency (paidAt≥createdAt, endDate≥startDate, Feb–Aug 2026), money math Decimal 2dp, existing demo-script assumptions intact, README table complete.
- If issues: dispatch fixes to the SAME implementer session (task_id `ses_008d10887ffeQqS3ErpLwqFQqw`), no commits.
- Known B3 concerns to weigh: Unsplash photo IDs need eyeballing at deploy; hardcoded Feb–Aug 2026 dates age if seeded later; seed `update: {}` on users preserves existing passwords.

### Step 2: F1–F5 (frontend, `~/projects/gearup-frontend`)
Use the master plan Phases 2–6. Key constraints:
- Next.js 15 App Router + Tailwind 4 + TanStack Query + Zustand. Dark mode class-based (`@custom-variant dark` in `globals.css`). Brand = **GearUp** (NOT RentNRoam). Colors: blaze (orange primary) + moss/fern (green secondary) + neutrals — ≤3 primaries, keep tokens.
- New deps allowed: `react-hook-form`, `zod`, `@hookform/resolvers`, `recharts` (plan Phase 2). No radix/shadcn CLI — build shadcn-style primitives by hand using existing tokens (plan says "shadcn-style, API-compatible with existing button/field").
- Proxy auth pattern: public calls via `lib/api.ts` `apiRequest`, authenticated via `/api/proxy` + `apiClient` (httpOnly cookie). Server components fetch with `apiRequest` (see `app/page.tsx`).
- API now supports: `search`, `location`, `avgRating`/`reviewCount` in gear payloads, analytics endpoints, contact, newsletter, password change. Frontend work does NOT need backend changes unless a gap is found — flag gaps instead.
- Route guard middleware: `src/middleware.ts` (role cookies `gearup_role`).
- Per task: update `docs/2026-08-12-task-progress.md` BEFORE starting and AFTER finishing. Never commit/push.

### Step 3: Phase Q (QA + deploy) — NOT POSSIBLE in this environment
Needs: docker sudo access or a postgres for `prisma migrate dev`/`db push` + `db:seed`, demo scripts run, then Vercel deploy (API migrate deploy first, then frontend). Also: browser walkthrough of full rental loop (browse → rent → confirm → Stripe test card 4242… → pickup → return → review) for all 3 roles; lint/build clean both repos; READMEs + `API_INTEGRATION.md` updates; live URLs + demo credentials per instructor §13.

## 5. Recurring conventions (follow them)

- **Review loop per task**: implementer subagent (full task text pasted, no plan-file reading, report format Status/Implemented/Tested/Files/Concerns) → spec reviewer (verify by reading code, never trust report) → code quality reviewer (BASE=HEAD sha or working-tree diff) → fixes by same implementer session → re-review → update progress doc → next task.
- Subagent statuses: DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT — never ignore escalations.
- Backend style: `asyncHandler`, `sendSuccess(res, data, msg)` envelope `{success, data}`, `AppError(msg, status)`, zod schemas centralized in `src/middleware/validate.ts`, router registration in `src/app.ts`, router-level `authenticate + authorize("ROLE")`.
- Swagger: regenerate via `npm run build` (checked into `src/config/swagger.json`) — new endpoints need `@swagger` comments.
- Migrations: hand-written folders `prisma/migrations/<epoch>_<name>/migration.sql` mirroring init conventions (TEXT PK, `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`). No DB available → never run migrate commands here.

## 7. Outstanding fixes (from owner verification pass)

> UPDATE: All four items below were FIXED on 2026-08-12 (see `docs/2026-08-12-task-progress.md` → "FIXES APPLIED"). Remaining: Phase Q (QA + deploy) only.

1. **Dashboards: tabs → sidebar.** Instructor §7 requires sidebar navigation (customer 4 items, admin 6+). All three dashboards currently use horizontal `Tabs` strips. Either build the shared sidebar layout from plan Phase 5.1 or get explicit owner sign-off to keep tabs as a documented deviation.
2. **Footer social icons**: replace dead `href="#"` placeholders (`src/components/footer.tsx:21-29`) with working links (real GitHub repos are the honest option) or remove them.
3. **Provider gear create/edit forms**: add `location` field + `specifications` (JSON textarea or key-value rows) + multiple image URLs (backend `images String[]` supported; form sends single URL) — `src/app/dashboard/provider/gear/new/page.tsx`, `edit/page.tsx`.
4. Hero: tighten `max-h-[75vh]` to ≤70vh (`src/app/page.tsx:83`).
5. Then: Phase Q (QA + deploy) — needs docker-capable env: `prisma migrate dev` + `db:seed` (includes new demo accounts summit@/wave@/alex@/sara@), `demo/run-all.sh`, Vercel deploy, browser walkthrough of the full rental loop, README/API_INTEGRATION updates, instructor §13 submission info.

## 6. Gotchas

- `gitignore` in gearup-api has a pre-existing uncommitted `.vercel` line — not ours, leave it.
- `.env` must be created from `.env.example` locally when a DB becomes available.
- Frontend `PRODUCT.md` says "RentNRoam" — owner decided to KEEP GearUp (docs/2026-08-12-upgrade-plan.md Phase 0).
- Electronics of dashboard charts come from the new analytics endpoints; tables need filtering + pagination (instructor requirement).
- No `migration_lock.toml` in gearup-api (repo convention — first `migrate dev` elsewhere may want to create it; harmless).