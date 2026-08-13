# RentNRoam — Demo Credentials

Matches `prisma/seed.ts` in [rentnroam-api](https://github.com/MS-Jahan/rentnroam-api). All passwords are bcrypt-hashed in the database.

## Live URLs (production)

| Service | URL |
|---------|-----|
| Frontend | https://rentnroam-frontend.vercel.app |
| API | https://rentnroam-api.vercel.app |
| Swagger | https://rentnroam-api.vercel.app/api/docs |

## Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Admin** | `admin@gearup.com` | `Admin@12345` | Platform moderation, analytics, user management |
| **Provider** | `provider@gearup.com` | `Provider@123` | Adventure Gear Shop — primary demo provider |
| **Provider** | `summit@gearup.com` | `Summit@123` | Summit Rentals |
| **Provider** | `wave@gearup.com` | `Wave@123` | Wave & Trail Co |
| **Customer** | `customer@gearup.com` | `Customer@123` | Rahim Khan — primary demo customer |
| **Customer** | `alex@gearup.com` | `Alex@123` | Alex Rahman |
| **Customer** | `sara@gearup.com` | `Sara@123` | Sara Islam |

## One-click demo (frontend)

Sign-in page has one-click buttons for **Customer**, **Provider**, and **Admin** only (the three primary accounts above).

## Stripe test card

- Number: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: `123`

## Admin env overrides

Seed reads optional env vars (defaults match table above):

- `ADMIN_EMAIL` (default `admin@gearup.com`)
- `ADMIN_PASSWORD` (default `Admin@12345`)
