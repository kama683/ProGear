# ProGear

> A full-stack equipment rental and sales platform — browse, book, and manage equipment orders online.

---

<img width="1920" height="862" alt="image" src="https://github.com/user-attachments/assets/5429adc2-2323-4e0a-8045-720273dc4786" />
<img width="1920" height="871" alt="image" src="https://github.com/user-attachments/assets/2e32d05e-91d8-4b50-a456-a1fb274e28bf" />

## Problem Statement

Renting or buying professional equipment traditionally requires phone calls, in-person visits, and paper-based order tracking. ProGear digitizes the entire process: customers can browse available equipment, view photo galleries, check real-time availability, calculate costs, and place bookings — all from a web browser. Admins and managers can manage inventory, track orders, and update statuses from the same interface.

---

## Features

### Customer
- **Equipment catalog** — browse and filter by type (rental / sale / both) and category, with search and sorting
- **Photo gallery** — multiple product photos with thumbnail navigation and arrow controls on the detail page
- **Store location** — embedded Google Maps mini-map with pickup address on each product page
- **Availability checker** — real-time availability for any date range, directly on the equipment page
- **Cost calculator** — instant rental cost estimates by days or hours before booking
- **Inline booking** — check availability and book without leaving the product page
- **Wishlist** — save favourite items for later
- **Shopping cart** — add rental and sale items, review before ordering
- **Orders** — create orders, track statuses (reserved → checked out → returned → completed)
- **Invoices** — download invoices for completed orders
- **Reviews & ratings** — leave a star rating and comment on rented equipment
- **Profile** — manage name, phone (Kazakhstan format), and address

### Admin / Manager
- **Equipment management** — create, edit, and delete catalog items with photos and store address
- **Serial number tracking** — assign individual serial numbers to physical units
- **Order management** — view all orders and update statuses
- **User management** — view users and manage roles (Admin only)
- **Swagger UI** — interactive API documentation at `/swagger`

---

## Technology Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Go 1.25, Fiber v2                       |
| Database   | PostgreSQL 14+ (pgx v5 driver)          |
| Frontend   | React 19, TypeScript, Vite 6            |
| State      | TanStack Query (React Query) v5         |
| Routing    | React Router v7                         |
| Auth       | JWT (access + refresh tokens)           |
| Maps       | Google Maps Embed (no API key required) |
| API Docs   | OpenAPI 3 / Swagger UI                  |
| Deploy     | Vercel (frontend), custom server (API)  |

---

## Project Structure

```
ProGear/
├── src/
│   ├── backend/                 # Go REST API
│   │   ├── internal/
│   │   │   ├── config/          # Environment config loader
│   │   │   ├── constants/       # Role and status definitions
│   │   │   ├── db/              # PostgreSQL connection & schema migrations
│   │   │   ├── dto/             # Request / response data transfer objects
│   │   │   ├── extensions/      # Fiber middleware (JWT auth, role guards)
│   │   │   ├── handler/         # HTTP route handlers
│   │   │   ├── model/           # Domain models
│   │   │   ├── service/         # Business logic layer
│   │   │   └── util/            # Helpers (hashing, tokens, etc.)
│   │   ├── docs/                # OpenAPI / Swagger spec
│   │   ├── main.go
│   │   ├── go.mod
│   │   └── dev.env              # Local environment variables
│   └── frontend/                # React + TypeScript SPA
│       └── src/
│           ├── api/             # API client functions (equipment, rentals, orders…)
│           ├── components/      # Shared UI components (Badge, Alert, Spinner…)
│           ├── context/         # React context (Auth, Cart, Wishlist, Toast)
│           ├── hooks/           # Custom hooks (useToast)
│           ├── pages/           # Page components by feature
│           │   ├── auth/        # Login, Register
│           │   ├── equipment/   # List, Detail, Form (create/edit)
│           │   ├── rentals/     # Rental booking page
│           │   ├── orders/      # Order list, detail, create
│           │   ├── wishlist/    # Saved items
│           │   ├── profile/     # User profile
│           │   ├── admin/       # User management (Admin only)
│           │   └── landing/     # Public landing page
│           ├── router/          # Route definitions & guards
│           ├── types/           # Shared TypeScript interfaces
│           └── utils/           # Formatters (currency, date, badges)
├── assets/                      # Screenshots and shared assets
├── docs/                        # Project-level documentation
├── vercel.json                  # Vercel SPA rewrite rules
├── README.md
├── AUDIT.md
├── REPORT.md
└── LICENSE
```

---

## Getting Started

### Prerequisites

- Go 1.25+
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd src/backend

# Configure environment (copy dev.env or create .env)
# Required variables: DATABASE_URL, JWT_SECRET, APP_PORT

# Run the server
go run main.go
```

The API will be available at `http://localhost:8080`.  
Swagger UI: `http://localhost:8080/swagger`

> The schema is applied automatically on first run — no manual migrations needed.

### Frontend

```bash
cd src/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable       | Description                              | Example                                      |
|----------------|------------------------------------------|----------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string             | `postgres://user:pass@localhost:5432/progear` |
| `JWT_SECRET`   | Secret key for signing JWT tokens        | `supersecretkey`                             |
| `APP_PORT`     | Port the API listens on                  | `8080`                                       |

---

## API Reference

Full interactive documentation is available via Swagger UI when the backend is running:

```
http://localhost:8080/swagger
```

Key endpoints:

| Method | Path                              | Auth     | Description                        |
|--------|-----------------------------------|----------|------------------------------------|
| POST   | /api/v1/auth/register             | —        | Register a new account             |
| POST   | /api/v1/auth/login                | —        | Log in, receive JWT tokens         |
| POST   | /api/v1/auth/refresh              | —        | Refresh access token               |
| GET    | /api/v1/equipment                 | —        | List equipment (filter, search)    |
| GET    | /api/v1/equipment/:id             | —        | Equipment detail with availability |
| POST   | /api/v1/equipment                 | Manager+ | Create equipment                   |
| PUT    | /api/v1/equipment/:id             | Manager+ | Update equipment                   |
| GET    | /api/v1/rentals/availability      | —        | Check availability for date range  |
| POST   | /api/v1/rentals/calculate         | —        | Calculate rental cost              |
| POST   | /api/v1/rentals/book              | Customer | Book a unit                        |
| GET    | /api/v1/orders                    | Auth     | List orders                        |
| POST   | /api/v1/orders                    | Customer | Create an order                    |
| PUT    | /api/v1/orders/:id/status         | Manager+ | Update order status                |
| GET    | /api/v1/orders/:id/invoice        | Auth     | Get order invoice                  |
| GET    | /api/v1/equipment/:id/reviews     | —        | Get reviews for equipment          |
| POST   | /api/v1/equipment/:id/reviews     | Customer | Submit a review                    |
| GET    | /api/v1/users                     | Admin    | List all users                     |

---

## User Roles

| Role     | Capabilities                                                        |
|----------|---------------------------------------------------------------------|
| Customer | Browse, wishlist, cart, book, order, review, manage own profile     |
| Manager  | All of Customer + create/edit equipment, update order statuses      |
| Admin    | All of Manager + manage users and roles                             |

---

## License

[MIT](LICENSE)
