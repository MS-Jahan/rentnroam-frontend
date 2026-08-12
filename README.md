# RentNRoam Frontend

Next.js 15 application for renting sports and outdoor equipment. Connects to the RentNRoam API for authentication, gear listings, rental bookings, role-based analytics, and Stripe Checkout payments.

---

## 🔗 Quick Links (Instructor §13 Submission Requirements)

| Deliverable | URL / Link |
|-------------|------------|
| **Live Website URL** | https://gearup-frontend-kappa.vercel.app |
| **Backend API URL** | https://gearup-api.vercel.app |
| **Backend Swagger Docs** | https://gearup-api.vercel.app/api/docs |
| **Frontend GitHub Repo** | https://github.com/MS-Jahan/rentnroam-frontend |
| **Backend GitHub Repo** | https://github.com/MS-Jahan/rentnroam-api |

---

## 🔑 Demo Credentials (One-Click Available on Sign In Page)

| Role | Email | Password | Features / Dashboard |
|------|-------|----------|----------------------|
| **Admin** | `admin@gearup.com` | `Admin@12345` | Platform-wide user management, gear moderation, system analytics charts |
| **Provider** | `provider@gearup.com` | `Provider@123` | Inventory management, incoming rental fulfillment, shop revenue bar charts |
| **Customer** | `customer@gearup.com` | `Customer@123` | Equipment browsing, rental booking, Stripe payments, monthly spending bar chart |

*Stripe Test Card:* `4242 4242 4242 4242` (expiry: any future date, CVC: `123`)

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack, React 19)
- **Styling & Tokens:** Tailwind CSS 4, Barlow Condensed + Source Sans 3 Google Fonts, Light/Dark Mode
- **State & Data:** TanStack Query v5 (React Query) + Zustand auth store
- **Forms & Validation:** React Hook Form + Zod validation schemas
- **Charts & UI:** Recharts (responsive bar/line/pie chart card primitives), Lucide React icons, Sonner toasts
- **Security:** Proxy auth architecture with httpOnly cookie token storage and middleware route guards

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/MS-Jahan/rentnroam-frontend.git
cd rentnroam-frontend

# Set up environment variables
cp .env.example .env.local

# Install dependencies
npm install

# Start local dev server
npm run dev
```

- Frontend App: http://localhost:3000
- API Integration Guide: [API_INTEGRATION.md](./API_INTEGRATION.md)
