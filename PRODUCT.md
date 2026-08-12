# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who need sports and outdoor gear for a moment, not a lifetime:

- Occasional adventurers renting gear for a trip, season, or one-off outing instead of buying expensive equipment.
- Budget-conscious regulars who want variety or cannot justify owning everything their hobby needs.
- Community renters borrowing from local gear owners.

Three roles share the product: customers browse and rent; providers list gear, manage inventory, and fulfill orders; admins moderate users, gear, and rentals.

Secondary audience: this is a portfolio/demo project, so recruiters and developers who walk the demo accounts are evaluators of the experience itself.

## Product Purpose

A gear rental marketplace where customers rent sports and outdoor equipment from providers, end to end: browse, rent, pay, fulfill, review. Success means the full loop is completable by a first-time user in every role without outside help, and the demo credibly shows a working marketplace.

## Positioning

A complete rental loop with real mechanics — role-based dashboards, real auth, and real Stripe checkout — rather than a storefront mock. The marketplace works end to end in test mode; nothing in the flow is faked.

## Operating Context

- Responsive web app; dev via `npm run dev` on localhost:3000; deployed on Vercel with a separate Vercel-hosted API (Swagger documented).
- Demo accounts exist per role (admin / provider / customer); Stripe test card `4242 4242 4242 4242` completes payments.
- Auth runs through Next.js route handlers setting an httpOnly cookie; browser calls go through a proxy route that attaches the token.

## Capabilities and Constraints

- Confirmed functionality: public catalog with filters and gear detail; customer rentals, orders, payment history, reviews; provider inventory CRUD, availability toggles, order status; admin moderation of users, gear, and rentals.
- Preserve the three-role model and its dashboards/workflows.
- Preserve Stripe test-mode checkout (no production payments).
- Preserve the current stack and deployment: Next.js 15 (App Router) + TypeScript + Tailwind 4, TanStack Query, Zustand; Vercel frontend + API.
- Backend is a separate API the frontend does not control; delete is blocked where rental/review history exists.

## Brand Commitments

- Product name is **RentNRoam**. The complete rebranding from the former name "GearUp" has been applied across all UI components, brand copy, navigation headers, footers, package configs, and repository names (`MS-Jahan/rentnroam-frontend` and `MS-Jahan/rentnroam-api`).

## Evidence on Hand

- Live deployments: frontend (gearup-frontend-kappa.vercel.app) and API (gearup-api.vercel.app); API Swagger docs.
- Working demo accounts for all three roles and a Stripe test card (see README.md).
- Absences: no real customers, testimonials, reviews, or press. Future work must not fabricate any.

## Product Principles

1. The rental loop must be completable end to end by a first-time user in any role, unaided.
2. Real mechanics over mockups: real auth, real API data, real checkout in test mode.
3. Three roles, one product — every surface serves customer, provider, or admin; role boundaries stay unambiguous.
4. Gear decisions are practical: availability, price, and dates outrank decoration.
5. The demo is the pitch: clarity and polish carry credibility with the evaluators walking through it.
