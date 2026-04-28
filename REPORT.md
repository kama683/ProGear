# ProGear — Project Technical Report

> **Codename:** Pixel Rental  
> **Report date:** April 2026  
> **Status:** Active development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Role-Based Access Control](#4-role-based-access-control)
5. [Backend — API Reference](#5-backend--api-reference)
6. [Database Schema](#6-database-schema)
7. [Frontend — Page Inventory](#7-frontend--page-inventory)
8. [Landing Page](#8-landing-page)
9. [Key Frontend Patterns](#9-key-frontend-patterns)
10. [Project File Structure](#10-project-file-structure)
11. [Deployment](#11-deployment)
12. [Development Setup](#12-development-setup)

---

## 1. Project Overview

**ProGear** is a full-stack web platform for renting and selling professional video and cinema equipment. It replaces manual phone-based booking and paper order forms with a modern online workflow.

### Core Features

| Feature | Description |
|---|---|
| Equipment catalog | Browse, search and filter gear by category and type |
| Rental booking | Check availability, calculate cost, book by day or hour |
| Order management | Create, track and manage rental and sale orders |
| Invoice download | Generate and download order invoices |
| User profiles | View and edit personal account information |
| Admin panel | Manage users, equipment and order statuses |
| Swagger docs | Interactive REST API documentation at `/swagger` |
| Landing page | Public marketing page with animated hero, catalog preview and CTA |

### Target Users

- **Filmmakers & cinematographers** — rent cinema cameras and lenses
- **Content creators** — access stabilizers, microphones and lighting
- **Production studios** — purchase or long-term rent premium gear
- **Platform managers** — manage inventory and process orders

---

## 2. Tech Stack

### Backend

| Layer | Technology | Version |
|---|---|---|
| Language | Go | 1.25.4 |
| HTTP Framework | Fiber v2 | 2.52.12 |
| Database | PostgreSQL | External instance |
| DB Driver | pgx/v5 | 5.9.1 |
| Authentication | JWT (Bearer tokens) | — |
| Password hashing | bcrypt | configurable cost |
| API Docs | Swagger / OpenAPI 3.0 | — |

### Frontend

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19.2.4 |
| Language | TypeScript | ~6.0.2 |
| Build Tool | Vite | 8.0.4 |
| Routing | React Router | 7.14.1 |
| Server State | TanStack React Query | 5.99.0 |
| Forms | React Hook Form | 7.72.1 |
| Validation | Zod | 4.3.6 |
| Animations | Framer Motion | 12.38.0 |
| Styling | Tailwind CSS | 3.4.19 |
| Icons | Lucide React | 1.8.0 |
| Date Utilities | date-fns | 4.1.0 |

### Infrastructure

| Layer | Technology |
|---|---|
| Frontend Hosting | Vercel (SPA mode) |
| Backend Hosting | Standalone Go binary |
| Database | External PostgreSQL |
| CI/CD | Vercel auto-deploy on push |

---

## 3. Architecture

### Backend — Layered Architecture

```
HTTP Request
    │
    ▼
┌─────────────────────────────────┐
│  Fiber Middleware               │  CORS, JWT Auth, Route Groups
├─────────────────────────────────┤
│  Handler Layer                  │  Parses request, calls service, returns response
│  (internal/handler/)           │
├─────────────────────────────────┤
│  Service Layer                  │  Business logic, validation, orchestration
│  (internal/service/)           │
├─────────────────────────────────┤
│  Database Layer                 │  Raw SQL via pgx/v5, connection pooling
│  (internal/db/)                │
└─────────────────────────────────┘
    │
    ▼
PostgreSQL
```

**Data flow:**
- Requests arrive at Fiber router → JWT middleware validates the Bearer token where required
- Handler parses and validates request body (using DTO structs)
- Service executes business logic (cost calculation, availability checking, etc.)
- Service calls DB layer which executes parameterized SQL queries
- Response is serialized to JSON and returned

### Frontend — Component Architecture

```
App
├── QueryClientProvider (TanStack React Query)
│   └── AuthProvider (AuthContext)
│       └── ToastProvider
│           └── RouterProvider
│               ├── LandingPage          (public)
│               ├── AuthLayout
│               │   ├── LoginPage
│               │   └── RegisterPage
│               └── ProtectedRoute
│                   └── AppLayout
│                       ├── Sidebar
│                       ├── Header
│                       └── [Page Components]
```

### Communication Flow

```
Browser → Vercel CDN → index.html (SPA)
    │
    └─ /api/* ──────────────────────────────→ Go Backend (port 8080)
                JWT in Authorization header      PostgreSQL
```

In **development**, Vite proxies all `/api/*` requests to `http://localhost:8080`.  
In **production**, the frontend calls the backend URL directly from environment variables.

---

## 4. Role-Based Access Control

The system implements three user roles enforced at both the API middleware level and the frontend route guard level.

| Permission | Customer | Manager | Admin |
|---|:---:|:---:|:---:|
| Browse equipment catalog | ✓ | ✓ | ✓ |
| Check rental availability | ✓ | ✓ | ✓ |
| Book equipment / create order | ✓ | ✓ | ✓ |
| View own orders | ✓ | ✓ | ✓ |
| View own profile | ✓ | ✓ | ✓ |
| Create / edit equipment | — | ✓ | ✓ |
| Update order status | — | ✓ | ✓ |
| List all users | — | — | ✓ |
| Manage user roles | — | — | ✓ |

### Backend Enforcement

JWT middleware in `internal/extensions/fiber_auth.go` validates the token and attaches the user's role to the request context. Route groups are wrapped with role-check middleware before the handler is called.

### Frontend Enforcement

`ProtectedRoute` component in `src/components/ProtectedRoute.tsx` reads `AuthContext`, checks `user.Role` against the optional `roles[]` prop, and redirects unauthorized users to `/` or `/login`.

---

## 5. Backend — API Reference

**Base path:** `/api/v1`  
**Auth:** `Authorization: Bearer <token>` header (where required)

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create new user account |
| `POST` | `/auth/login` | Public | Authenticate user, receive JWT |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me` | Required | Get current user profile |
| `GET` | `/users` | Admin only | List all registered users |

### Equipment

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/equipment` | Public | List equipment (optional `?type=` filter) |
| `GET` | `/equipment/:id` | Public | Equipment detail + availability + serials |
| `POST` | `/equipment` | Manager / Admin | Create new equipment record |
| `PUT` | `/equipment/:id` | Manager / Admin | Update equipment record |

### Rentals

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/rentals/availability` | Public | Check availability for date range |
| `POST` | `/rentals/calculate` | Public | Estimate rental cost |
| `POST` | `/rentals/book` | Customer | Create rental reservation |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/orders` | Customer | Create new order |
| `GET` | `/orders` | Required | List orders (filtered by user role) |
| `GET` | `/orders/:id` | Required | Get order detail |
| `PATCH` | `/orders/:id/status` | Manager / Admin | Update order status |
| `GET` | `/orders/:id/invoice` | Required | Download order invoice |

### Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/swagger` | Interactive Swagger UI |
| `GET` | `/docs/openapi.yaml` | OpenAPI 3.0 spec |

---

## 6. Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | TEXT | Full name |
| email | TEXT | Unique |
| password_hash | TEXT | bcrypt |
| role | TEXT | `customer` / `manager` / `admin` |
| created_at | TIMESTAMPTZ | — |

### `equipment`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | TEXT | — |
| category | TEXT | e.g. Camera, Lens, Stabilizer |
| description | TEXT | — |
| type | TEXT | `rental` / `sale` / `both` |
| daily_rate | NUMERIC | Rental price per day |
| sale_price | NUMERIC | Purchase price |
| quantity | INTEGER | Total units |
| created_at | TIMESTAMPTZ | — |

### `equipment_serials`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| equipment_id | UUID | FK → equipment |
| serial_number | TEXT | Unique per equipment |
| status | TEXT | `available` / `rented` / `sold` |

### `orders`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| type | TEXT | `rental` / `sale` |
| status | TEXT | `reserved` / `checked_out` / `returned` / `completed` / `cancelled` |
| total_amount | NUMERIC | — |
| created_at | TIMESTAMPTZ | — |

### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| order_id | UUID | FK → orders |
| equipment_id | UUID | FK → equipment |
| type | TEXT | `rental` / `sale` |
| quantity | INTEGER | — |
| unit_price | NUMERIC | Price at time of order |
| start_date | DATE | Rental start (nullable for sale) |
| end_date | DATE | Rental end (nullable for sale) |

### `rentals`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| equipment_id | UUID | FK → equipment |
| order_item_id | UUID | FK → order_items |
| start_date | DATE | — |
| end_date | DATE | — |
| status | TEXT | `reserved` / `active` / `completed` / `cancelled` |

---

## 7. Frontend — Page Inventory

13 page components across 6 functional areas:

| Route | Component File | Access Level |
|---|---|---|
| `/` | `pages/landing/LandingPage.tsx` | Public |
| `/login` | `pages/auth/LoginPage.tsx` | Public |
| `/register` | `pages/auth/RegisterPage.tsx` | Public |
| `/dashboard` | `pages/DashboardPage.tsx` | Authenticated |
| `/equipment` | `pages/equipment/EquipmentListPage.tsx` | Authenticated |
| `/equipment/new` | `pages/equipment/EquipmentFormPage.tsx` | Manager / Admin |
| `/equipment/:id` | `pages/equipment/EquipmentDetailPage.tsx` | Authenticated |
| `/equipment/:id/edit` | `pages/equipment/EquipmentFormPage.tsx` | Manager / Admin |
| `/rentals` | `pages/rentals/RentalPage.tsx` | Customer |
| `/orders` | `pages/orders/OrdersListPage.tsx` | Authenticated |
| `/orders/new` | `pages/orders/CreateOrderPage.tsx` | Customer |
| `/orders/:id` | `pages/orders/OrderDetailPage.tsx` | Authenticated |
| `/profile` | `pages/profile/ProfilePage.tsx` | Authenticated |
| `/admin/users` | `pages/admin/UsersListPage.tsx` | Admin |

**Fallback:** All unmatched routes (`*`) redirect to `/`.

---

## 8. Landing Page

A custom Apple-style dark marketing page built with Tailwind CSS and Framer Motion, served publicly at `/`.

### Sections

| Component | Description |
|---|---|
| `Navbar.tsx` | Sticky top bar; transparent → blur-background on scroll; mobile hamburger menu |
| `Hero.tsx` | Full-viewport section; gradient headline; mouse-tracked 3D camera; animated background blobs; trust indicators |
| `Camera3D.tsx` | Pure SVG/CSS cinema camera; 6-ring lens with radial gradients; parallax on mouse move; floating keyframe animation |
| `AboutSection.tsx` | 3 glassmorphism cards (Rental / Sales / Support) with gradient border on hover; Framer Motion stagger |
| `StatsSection.tsx` | 4 stat counters animated with `requestAnimationFrame` on viewport entry (500+ items, 5 yrs, 1000+ clients, 24/7) |
| `CatalogPreview.tsx` | Grid of 6 mock product cards; gradient image areas; hover scale + tilt via Framer Motion |
| `CTASection.tsx` | Gradient-bordered card; feature badges; "Create Free Account" and "Sign In" CTAs |
| `Footer.tsx` | Brand, contact info, Services / Company / Account link columns; social icon buttons |

### Visual Style

- **Background:** `#0A0A0F` → `#13131A` (deep dark with subtle blue tint)
- **Accents:** `violet-500` → `fuchsia-500` → `cyan-400` gradient palette
- **Cards:** `rgba(255,255,255,0.05)` background + `rgba(255,255,255,0.1)` border → glassmorphism
- **Typography:** Inter, 300–900 weight range; gradient text via `bg-clip-text`
- **Animations:** Framer Motion `whileInView` fade-up with stagger; CSS keyframe blobs and float

---

## 9. Key Frontend Patterns

### Auth Context (`src/context/AuthContext.tsx`)

Central authentication state. Persists user to `localStorage`. Exports:

```ts
interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isCustomer: boolean;
  canManageEquipment: boolean;  // isAdmin || isManager
  canManageOrders: boolean;     // isAdmin || isManager
}
```

### Protected Route (`src/components/ProtectedRoute.tsx`)

Wraps any route to enforce authentication and optional role restrictions:

```tsx
<ProtectedRoute roles={['admin', 'manager']}>
  <EquipmentFormPage />
</ProtectedRoute>
```

### API Clients (`src/api/`)

Six typed module files, each exporting async functions that call the backend via a shared `client.ts` base (sets `Authorization` header from localStorage token):

- `auth.ts` — `login()`, `register()`
- `equipment.ts` — `listEquipment()`, `getEquipment()`, `createEquipment()`, `updateEquipment()`
- `orders.ts` — `createOrder()`, `listOrders()`, `getOrder()`, `updateOrderStatus()`, `getInvoice()`
- `rentals.ts` — `checkAvailability()`, `calculateCost()`, `bookRental()`
- `users.ts` — `getMe()`, `listUsers()`

### Form Stack

All forms use **React Hook Form** with **Zod** resolvers for type-safe validation at compile time and runtime:

```ts
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const form = useForm({ resolver: zodResolver(schema) });
```

### Data Fetching

All server state is managed by **TanStack React Query**. Default config: `retry: 1`, `staleTime: 30s`. Queries are defined inline per page with typed `useQuery` / `useMutation` calls.

---

## 10. Project File Structure

```
ProGear/
├── vercel.json                         Vercel SPA rewrite config
├── REPORT.md                           This document
├── README.md                           Project overview
├── AUDIT.md                            Security / code audit notes
├── LICENSE
├── .gitignore
│
├── src/
│   │
│   ├── backend/
│   │   ├── main.go                     Fiber server entry point, route registration
│   │   ├── go.mod / go.sum
│   │   ├── .env                        Production environment variables
│   │   ├── dev.env                     Development environment variables
│   │   ├── internal/
│   │   │   ├── config/config.go        Loads env vars into Config struct
│   │   │   ├── constants/roles.go      Role constant definitions
│   │   │   ├── db/
│   │   │   │   ├── db.go               pgx/v5 connection pool setup
│   │   │   │   └── schema.go           Auto-initializes all tables on startup
│   │   │   ├── dto/                    Request / response DTO structs (5 files)
│   │   │   ├── extensions/
│   │   │   │   └── fiber_auth.go       JWT validation middleware, role guards
│   │   │   ├── handler/                HTTP handler methods (5 files)
│   │   │   ├── model/                  Domain model structs (3 files)
│   │   │   ├── service/                Business logic layer (5 files)
│   │   │   └── util/security.go        bcrypt hashing, JWT sign / verify
│   │   └── docs/
│   │       ├── openapi.yaml
│   │       ├── swagger.json
│   │       └── swagger.yaml
│   │
│   └── frontend/
│       ├── index.html                  SPA shell; loads Inter from Google Fonts
│       ├── vite.config.ts              React plugin; /api proxy in dev
│       ├── tailwind.config.js          Custom dark theme, animation keyframes
│       ├── postcss.config.js
│       ├── tsconfig.json
│       ├── eslint.config.js
│       ├── package.json
│       ├── .env.development
│       ├── .env.production
│       └── src/
│           ├── main.tsx                React root, StrictMode
│           ├── App.tsx                 Providers + RouterProvider
│           ├── index.css               Tailwind utilities + custom CSS design system
│           ├── router/index.tsx        createBrowserRouter route config
│           ├── context/
│           │   └── AuthContext.tsx     Auth state, role flags, logout
│           ├── hooks/
│           │   └── useToast.tsx        Global toast notification system
│           ├── api/                    6 typed API client modules
│           ├── types/api.ts            Shared TypeScript interfaces
│           ├── utils/format.ts         Date, currency, status formatting helpers
│           ├── components/
│           │   ├── ProtectedRoute.tsx
│           │   ├── landing/            8 landing page section components
│           │   ├── layout/             AppLayout, AuthLayout, Sidebar, Header
│           │   └── ui/                 Alert, Badge, EmptyState, Modal, Spinner
│           └── pages/
│               ├── DashboardPage.tsx
│               ├── landing/LandingPage.tsx
│               ├── auth/               LoginPage, RegisterPage
│               ├── equipment/          List, Detail, Form
│               ├── orders/             List, Detail, Create
│               ├── rentals/            RentalPage
│               ├── profile/            ProfilePage
│               └── admin/              UsersListPage
```

---

## 11. Deployment

### Frontend (Vercel)

The React SPA is deployed to Vercel. The `vercel.json` at the repo root rewrites all paths to `index.html` so that React Router handles navigation client-side:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Build command: `npm run build` (outputs to `src/frontend/dist/`)  
Install command: `npm install` (run from `src/frontend/`)

### Backend

The Go backend compiles to a single self-contained binary:

```bash
cd src/backend
go build -o progear-server .
./progear-server
```

Required environment variables (`.env`):

| Variable | Description |
|---|---|
| `APP_PORT` | HTTP port (default 8080) |
| `APP_ENV` | `development` / `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret key for access tokens |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens |
| `JWT_ACCESS_EXPIRES` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES` | Refresh token TTL (e.g. `7d`) |
| `JWT_ISSUER` | Token issuer string |
| `JWT_AUDIENCE` | Token audience string |
| `BCRYPT_COST` | bcrypt work factor (recommended: 12) |

The database schema is created automatically on first run via `internal/db/schema.go`.

---

## 12. Development Setup

### Prerequisites

- Go 1.25+
- Node.js 20+
- PostgreSQL 15+ instance (local or remote)

### Backend

```bash
cd src/backend
cp dev.env .env          # fill in DATABASE_URL and JWT secrets
go mod download
go run main.go           # starts on :8080
# Swagger UI → http://localhost:8080/swagger
```

### Frontend

```bash
cd src/frontend
npm install
npm run dev              # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` → `http://localhost:8080` automatically.

### Build for Production

```bash
cd src/frontend
npm run build            # outputs to dist/
```

Deploy the `dist/` folder to Vercel (or any static host) with the `vercel.json` rewrite rule at the repository root.

---

*Report generated for ProGear — Professional Cinema Equipment Rental & Sales Platform*
