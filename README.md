# Pixel Rental

> A full-stack equipment rental platform — browse, book, and manage rental orders online.

---

## Problem Statement

Renting equipment traditionally requires phone calls, in-person visits, and paper-based order tracking. Pixel Rental digitizes the entire process: customers can browse available equipment, check availability, calculate costs, and place bookings — all from a web browser. Admins and managers can manage inventory and update order statuses from the same interface.

---

## Features

- **User authentication** — register and log in with JWT-secured sessions
- **Role-based access control** — Customer, Manager, and Admin roles with different permissions
- **Equipment catalog** — list and view details for available equipment
- **Availability checker** — query real-time availability for any date range
- **Cost calculator** — instant rental cost estimates before booking
- **Order management** — create orders, track status, and download invoices
- **Swagger UI** — interactive API documentation at `/swagger`

---

## Technology Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Go 1.25, Fiber v2                 |
| Database  | PostgreSQL (via pgx v5)           |
| Frontend  | React 19, TypeScript, Vite        |
| Auth      | JWT (Bearer token)                |
| API Docs  | OpenAPI 3 / Swagger UI            |

---

## Project Structure

```
pixel-rental/
├── backend/                 # Go REST API
│   ├── internal/
│   │   ├── config/          # App configuration loader
│   │   ├── constants/       # Role definitions
│   │   ├── db/              # Database connection & schema init
│   │   ├── dto/             # Request/response data transfer objects
│   │   ├── extensions/      # Fiber middleware (auth, roles)
│   │   ├── handler/         # HTTP route handlers
│   │   ├── model/           # Domain models
│   │   ├── service/         # Business logic layer
│   │   └── util/            # Helpers (security, etc.)
│   ├── docs/                # OpenAPI / Swagger spec files
│   ├── main.go
│   ├── go.mod
│   └── .env.example
├── frontend/                # React + TypeScript SPA
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # UI components
│   │   ├── context/         # React context (auth state)
│   │   ├── types/           # Shared TypeScript types
│   │   └── assets/          # Images used in the app
│   └── public/              # Static public assets
├── docs/                    # Project-level documentation
├── tests/                   # Integration / e2e tests
├── assets/                  # Shared assets (screenshots, etc.)
├── README.md
├── AUDIT.md
├── LICENSE
└── .gitignore
```

---

## Installation

### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, APP_PORT

# Run the server
go run main.go
```

The API will be available at `http://localhost:8080`.  
Swagger UI: `http://localhost:8080/swagger`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Usage

1. Open the frontend in your browser.
2. Register a new account (default role: Customer).
3. Browse the equipment catalog and check availability.
4. Place a booking — a rental order will be created.
5. Admins/Managers can log in to update order statuses via the API.

---

## API Reference

Full API documentation is available via Swagger UI when the backend is running:

```
http://localhost:8080/swagger
```

Key endpoints:

| Method | Path                        | Description              |
|--------|-----------------------------|--------------------------|
| POST   | /api/v1/auth/register       | Register a new user      |
| POST   | /api/v1/auth/login          | Log in, receive JWT      |
| GET    | /api/v1/equipment           | List all equipment       |
| GET    | /api/v1/rentals/availability| Check availability       |
| POST   | /api/v1/rentals/book        | Book a rental            |
| GET    | /api/v1/orders              | List orders (auth)       |
| GET    | /api/v1/orders/:id/invoice  | Download invoice (auth)  |

---

## Screenshots

![Hero](assets/hero.png)
