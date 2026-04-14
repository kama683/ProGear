# Architecture Overview

Pixel Rental follows a standard client-server architecture.

## Backend

- **Framework:** Go Fiber (fast HTTP server built on fasthttp)
- **Pattern:** Layered architecture — Handler → Service → DB
- **Auth:** JWT middleware applied per-route group
- **Database:** PostgreSQL, schema auto-initialized on startup via `db.InitSchema`

## Frontend

- **Framework:** React 19 with TypeScript
- **Build tool:** Vite
- **State:** React Context for auth state (`AuthContext`)
- **API calls:** Axios-style typed client in `src/api/`

## Communication

The frontend communicates with the backend REST API at `/api/v1/*`.  
CORS is configured on the backend to allow `localhost:3000` and `localhost:8080`.
