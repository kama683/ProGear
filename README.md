# ProGear
A full-stack equipment rental and sales platform where you can browse, book, buy and manage equipment orders online.

## Problem Statement
Renting or buying professional equipment usually means phone calls, in-person visits, and paper-based tracking. ProGear digitizes the whole process — customers can browse equipment, check availability, calculate costs, and place bookings from a web browser. Admins and managers can manage inventory and track orders from the same interface.

## Features
### Customer
- Browse and filter equipment by type (rental / sale / both) and category, with search and sorting
- View multiple product photos with thumbnail navigation on the detail page
- Check real-time availability for any date range directly on the equipment page
- Calculate rental costs instantly by days or hours before booking
- Book equipment without leaving the product page
- Save favourite items to a wishlist
- Add rental and sale items to a shopping cart and review before ordering
- Create orders and track statuses (reserved → checked out → returned → completed)
- Download invoices for completed orders
- Leave star ratings and comments on rented equipment
- View your name, phone, Email
 and address in your profile

### Admin / Manager
- Create, edit, and delete catalog items with photos and store address
- Assign individual serial numbers to physical units
- View all orders and update their statuses
- View users and manage roles — Admin only
- Access interactive API documentation at /swagger

## Installation
### Prerequisites
- Go 1.25+
- Node.js 18+
- PostgreSQL 14+

### Backend
cd src/backend

# Configure your environment variables: DATABASE_URL, JWT_SECRET, APP_PORT
go run main.go
> The database schema is applied automatically on first run — no manual migrations needed.

### Frontend
cd src/frontend
npm install
npm run dev

## Usage
Once both the backend and frontend are running, open the app in your browser. You can register as a new customer, browse the equipment catalog, check availability for your dates, and place a booking. If you have manager or admin access, you can also manage equipment and orders from the same interface.
Swagger UI (interactive API docs) is available at the /swagger path when the backend is running.

## Screenshots
<img width="1920" height="862" alt="image" src="https://github.com/user-attachments/assets/5429adc2-2323-4e0a-8045-720273dc4786" />
<img width="1920" height="871" alt="image" src="https://github.com/user-attachments/assets/2e32d05e-91d8-4b50-a456-a1fb274e28bf" />

## Technology Stack
| Layer | Technology |
|-------|------------|
| Backend | Go 1.25, Fiber v2 |
| Database | PostgreSQL 14+ (pgx v5 driver) |
| Frontend | React 19, TypeScript, Vite 6 |
| State | TanStack Query (React Query) v5 |
| Routing | React Router v7 |
| Auth | JWT (access + refresh tokens) |
| API Docs | OpenAPI 3 / Swagger UI |
| Deploy | Vercel (frontend), custom server (API) |



Yerassyl Kabdrash 230103041
Abylkanov Ansat 230103172
Kamron Yunussaliyev 230103293
Damir Bakhtiyarov 230103239
