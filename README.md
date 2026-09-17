# Guard Provider 🛡️

**A full-stack platform where customers find and request verified security guards, and guards/providers manage their professional profile, availability, requests and bookings.**

Guard Provider is a complete, working product — not a static mockup. It ships with a React SPA, a real REST API with JWT authentication and bcrypt password hashing, role-based dashboards (customer / guard / admin), an end-to-end request → booking → review lifecycle, in-app notifications, search & filters, and a database-ready service layer seeded with demo data so the UI is alive from the first second.

---

## Table of contents

- [Features](#features)
- [Demo accounts](#demo-accounts)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Folder structure](#folder-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Development commands](#development-commands)
- [Production build](#production-build)
- [API overview](#api-overview)
- [Data models](#data-models)
- [Swapping in a real database](#swapping-in-a-real-database)
- [Design notes](#design-notes)

---

## Features

### Public site
- Professional landing page: hero with service search, service categories, how it works, trust & safety, platform features, testimonials (clearly marked demo data), FAQ, contact section, footer
- Public guard directory with keyword search and filters: **location, service type, availability, experience, verification status**, plus sorting and pagination
- Detailed public guard profiles: verification badge, experience, skills, service types, service area, languages, about, ratings & reviews, request button
- Customer and guard registration/login, protected routes, role-based navigation

### Customer dashboard
- Overview with live stats, recent requests and top-rated guards
- Search guards with the full filter panel
- Send service requests (service, date, duration, location, requirements)
- Track requests through **Pending → Accepted / Rejected / Cancelled** (cancel while pending)
- Booking history with status tracking; leave a star review after completion
- Profile & settings (details + password change)

### Guard / provider dashboard
- Overview with new requests, upcoming bookings, rating and completed jobs
- Availability management (available / on duty / unavailable — unavailable hides you from search)
- Profile strength checklist and **verification submission** for admin review
- Full professional profile editor: title, about, city, service area, experience, hourly rate, skills, languages, service types
- Incoming requests: **accept (creates a booking instantly) or decline with a reason**
- Bookings: mark completed, cancel, read customer reviews

### Admin dashboard
- Platform statistics (users, guards, customers, requests, bookings, completions)
- Verification management with an approval queue
- All users / all requests / all bookings tables with filters
- Reports: requests by status, bookings by service, top-rated guards, growth numbers

### Cross-cutting
- In-app notification system (new request, accepted, rejected, booking updates, reviews, verification, account updates) with polling bell + full notifications page
- Toast notifications, loading skeletons, empty states, error states with retry
- Responsive layouts for mobile (slide-over sidebar), tablet and desktop
- Accessible forms (labels, `aria-invalid`, `role="alert"`), keyboard-dismissable modals
- No hardcoded secrets — everything is env-driven; passwords hashed with bcrypt; JWT auth

## Demo accounts

All demo accounts share the password **`Password123!`** (seeded automatically at first boot):

| Role     | Email                     | What you can do |
| -------- | ------------------------- | --------------- |
| Customer | `anita.desai@demo.in`     | Search guards, send/track requests, manage bookings & reviews |
| Guard    | `vikram.rathore@demo.in`  | Manage profile, availability, incoming requests, bookings |
| Admin    | `admin@guardprovider.demo`| Platform stats, users, verifications, reports |

The login page also has one-click demo account buttons.

## Tech stack

| Layer     | Technology |
| --------- | ---------- |
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS v4, React Router, lucide-react icons |
| Forms     | react-hook-form + zod (client), zod (server) |
| Backend   | Node.js, Express 5, TypeScript (ESM) |
| Auth      | JWT (Bearer) + bcryptjs password hashing, role-based middleware |
| Data      | `DataSource` repository interface + in-memory implementation seeded with demo data (database-ready — see below) |
| Tooling   | npm workspaces, ESLint 9 (flat config) + typescript-eslint, tsc strict mode |

## Architecture

```
┌───────────────────────────── monorepo (npm workspaces) ─────────────────────────────┐
│                                                                                     │
│  client (React SPA)                server (Express API)           shared (types)    │
│  ┌──────────────────────┐  /api   ┌──────────────────────┐        ┌──────────────┐  │
│  │ pages                │ ──────▶ │ routes (HTTP)        │        │ domain types │  │
│  │ components (reusable)│  proxy  │ validation (zod)     │        │ DTOs         │  │
│  │ context (auth/toast) │         │ services (business)  │ ◀───── │ payloads     │  │
│  │ hooks (useApi, etc.) │         │ data/ (DataSource)   │ import │              │  │
│  └──────────────────────┘         │   └─ memory + seed   │  type  └──────────────┘  │
└───────────────────────────── ─────────────────────────────────────────────────────────┘
```

Key separation: **routes → services → data**. The whole API depends only on the `DataSource`
interface (`server/src/data/DataSource.ts`) — never on storage internals. The client talks to
`/api` through the Vite dev proxy (or same-origin in production) and consumes typed DTOs from
`@guard-provider/shared` (a type-only package).

## Folder structure

```
guard-provider/
├── client/                        # React + Vite + Tailwind app
│   └── src/
│       ├── components/
│       │   ├── ui/                # Button, Input, Modal, Tabs, Badge, StatCard, …
│       │   ├── layout/            # PublicLayout, Navbar, Footer, DashboardLayout
│       │   ├── routing/           # RequireRole route guard
│       │   ├── guards/            # GuardCard, GuardFilters, RequestServiceModal
│       │   ├── requests/          # RequestCard (role-aware)
│       │   ├── bookings/          # BookingCard (role-aware)
│       │   ├── reviews/           # ReviewModal
│       │   └── notifications/     # NotificationBell
│       ├── pages/
│       │   ├── public/            # Landing (+landing sections), GuardDirectory,
│       │   │                      # GuardPublicProfile, Login, Register, NotFound
│       │   ├── customer/          # Dashboard, SearchGuards, MyRequests, MyBookings, Profile
│       │   ├── guard/             # Dashboard, Requests, Bookings, ProfileEditor
│       │   ├── admin/             # Dashboard, Users, Requests, Bookings, Reports
│       │   └── shared/            # NotificationsPage
│       ├── context/               # AuthContext, ToastContext
│       ├── hooks/                 # useApi, useDebouncedValue, useNotifications
│       ├── lib/                   # api client, constants, utils
│       └── styles/                # Tailwind v4 theme (brand tokens)
├── server/
│   └── src/
│       ├── routes/                # HTTP layer per domain
│       ├── services/              # Business logic + DTO assemblers
│       ├── data/                  # DataSource interface, memory impl, demo seed
│       ├── middleware/            # requireAuth/requireRole, error handler
│       ├── validation/            # zod schemas
│       ├── utils/                 # jwt, password, errors, ids, validation helpers
│       └── app.ts / index.ts      # Express assembly & bootstrap
├── shared/                        # Type-only package consumed by both apps
├── eslint.config.js               # Shared flat ESLint config
├── .env.example                   # Documented environment template
└── package.json                   # Workspaces + root scripts
```

## Getting started

Requirements: **Node.js 20+** (tested on Node 22).

```bash
# 1. Install everything (workspaces)
npm install

# 2. Configure environment
cp .env.example .env        # then edit at least JWT_SECRET

# 3. Run API + web app together
npm run dev
```

- Web app: http://localhost:5173
- API: http://localhost:4000/api (health check at `/api/health`)

The in-memory data source seeds itself with demo data on first boot
(`SEED_DEMO_DATA=true`). Data resets when the API restarts.

## Environment variables

Copy `.env.example` to `.env` (the server reads `server/.env` or the repo-root `.env`).

| Variable         | Default                      | Purpose |
| ---------------- | ---------------------------- | ------- |
| `PORT`           | `4000`                       | API port |
| `NODE_ENV`       | `development`                | `production` hides internal error messages |
| `JWT_SECRET`     | *(dev fallback + warning)*   | **Required in production.** Long random string |
| `JWT_EXPIRES_IN` | `7d`                         | Token lifetime |
| `BCRYPT_ROUNDS`  | `10`                         | Password hashing cost |
| `CLIENT_ORIGIN`  | `http://localhost:5173`      | Comma-separated CORS allowlist |
| `DATA_SOURCE`    | `memory`                     | Data source selector (see below) |
| `SEED_DEMO_DATA` | `true`                       | Seed demo data when the store is empty |
| `VITE_API_URL`   | *(unset → `/api` proxy)*     | Optional explicit API base URL for the client |

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Development commands

| Command                | What it does |
| ---------------------- | ------------ |
| `npm run dev`          | API (tsx watch) + web (Vite HMR) together |
| `npm run dev:api`      | API only |
| `npm run dev:web`      | Web only |
| `npm run typecheck`    | `tsc --noEmit` in all workspaces |
| `npm run lint`         | ESLint in all workspaces |
| `npm run clean`        | Remove build output |

## Production build

```bash
npm run build     # shared types → server (tsc) → client (vite build)
npm start         # serves the API *and* the built client from one process
```

`npm start` runs `server/dist/index.js`; if `client/dist` exists the server
serves it with an SPA fallback, giving a single-origin deployment.

## API overview

All endpoints are under `/api`. Authenticated routes expect `Authorization: Bearer <token>`.

| Method & path                             | Access        | Purpose |
| ----------------------------------------- | ------------- | ------- |
| `POST /auth/register`                     | public        | Register as customer or guard |
| `POST /auth/login`                        | public        | Sign in, returns JWT + profile |
| `GET /auth/me`                            | any authed    | Current user with profiles |
| `PATCH /users/me`                         | any authed    | Update name/phone (+customer address/city) |
| `PATCH /users/me/password`                | any authed    | Change password |
| `GET /services`                           | public        | Service categories |
| `GET /guards`                             | public        | Directory with search/filters/sort/pagination |
| `GET /guards/:id` · `GET /guards/:id/reviews` | public    | Profile + reviews |
| `GET/PATCH /guards/me/profile`            | guard         | Own professional profile |
| `POST /guards/me/submit-verification`     | guard         | Request admin verification |
| `POST /requests`                          | customer      | Send service request |
| `GET /requests/mine` · `/requests/incoming` | customer / guard | Request lists |
| `PATCH /requests/:id/accept` · `/reject`  | guard         | Respond (accept creates booking) |
| `PATCH /requests/:id/cancel`              | customer      | Cancel pending request |
| `GET /bookings/mine`                      | customer/guard| Own bookings |
| `PATCH /bookings/:id/status`              | participant   | Complete (guard) / cancel (both) |
| `POST /bookings/:id/review`               | customer      | Review completed booking (once) |
| `GET /notifications` · unread-count       | any authed    | List / unread badge |
| `PATCH /notifications/:id/read` · `/read-all` | any authed | Mark read |
| `GET /admin/stats` · `/users` · `/requests` · `/bookings` · `/reports` · `/verifications` | admin | Platform management |
| `PATCH /admin/guards/:guardId/verification` | admin       | Verify / reject a guard |

Errors are uniform JSON: `{ "error": { "code", "message", "details?" } }`.

## Data models

Defined once in `shared/src/index.ts` and used by both apps:
`User`, `CustomerProfile`, `GuardProfile`, `Service`, `ServiceRequest`, `Booking`,
`Review`, `VerificationRecord`, `AppNotification` — plus composed DTOs
(`GuardListing`, `ServiceRequestDto`, `BookingDto`, `AuthUser`, `Paginated<T>`, …)
and request payloads.

Statuses: request `pending → accepted | rejected | cancelled`;
booking `confirmed → completed | cancelled`;
verification `unverified → pending → verified | rejected`.

## Swapping in a real database

The API is deliberately database-agnostic:

1. Implement the `DataSource` interface from `server/src/data/DataSource.ts`
   (e.g. `PrismaDataSource` backed by Postgres, or Mongoose for MongoDB). Each
   repository (users, guards, requests, bookings, reviews, notifications,
   verifications, services) already documents exactly which operations the
   business layer needs — all async signatures, ready for real I/O.
2. Register it in `server/src/data/index.ts`:

   ```ts
   case 'postgres':
     return new PrismaDataSource(process.env.DATABASE_URL!);
   ```

3. Add `DATA_SOURCE=postgres` + `DATABASE_URL=…` to `.env`.

No route, service, or client code changes are required. The in-memory
implementation doubles as the reference for query semantics.

## Design notes

- Original visual identity: deep navy (`brand`) + signal gold (`accent`), Sora display / Inter body typography, shield motif.
- Reusable primitives (`Button`, `Card`, `Modal`, `Tabs`, `StatusBadge`, `EmptyState`, `StatCard`, …) keep pages declarative.
- Testimonials and platform counts on the landing page are **explicitly labelled demo data**; contact form validates locally and states that nothing is transmitted. No fake payment/chat integrations are pretended.

---

Built as a portfolio-grade demo. Frontend, API, auth, workflows and tests of logic are fully functional; storage is in-memory by design until a database is provisioned.
