# Rental API Endpoint Reference

This file lists all implemented HTTP endpoints, what they do, and their request/response bodies.

## Base URL

- API base path: `/api/v1`
- Swagger UI: `GET /swagger`
- Raw docs assets: `GET /docs/*`

## Auth and Roles

- Auth uses `Authorization` header with bearer token.
- Header accepted as either raw token or `Bearer <token>`.
- Roles used by the API: `admin`, `manager`, `customer`.

## Response Format Notes

- Error responses are JSON objects in the form:

```json
{
  "error": "message"
}
```

- DTO structs currently do not have `json` tags. In Go this means response keys are serialized with exported field names (for example `AccessToken`, `UserId`, `EquipmentID`, etc.).

---

## 1) Auth Endpoints

### POST `/api/v1/auth/register`
What it does: Creates a new `customer` user account.

Auth: none

Request body:

```json
{
  "Name": "string",
  "Email": "string",
  "Password": "string",
  "ConfirmPassword": "string"
}
```

Success response (`201`):

```json
{
  "User": {
    "ID": 0,
    "Name": "string",
    "Email": "string",
    "Role": "customer"
  }
}
```

Possible errors: `400`

### POST `/api/v1/auth/login`
What it does: Authenticates a user and returns access/refresh tokens.

Auth: none

Request body:

```json
{
  "Email": "string",
  "Password": "string"
}
```

Success response (`200`):

```json
{
  "AccessToken": "string",
  "RefreshToken": "string",
  "User": {
    "ID": 0,
    "Name": "string",
    "Email": "string",
    "Role": "string"
  }
}
```

Possible errors: `400`, `401`

---

## 2) User Endpoints

### GET `/api/v1/users/me`
What it does: Returns current authenticated user profile.

Auth: required (`admin|manager|customer`)

Request body: none

Success response (`200`):

```json
{
  "ID": 0,
  "Name": "string",
  "Email": "string",
  "Role": "string"
}
```

Possible errors: `401`, `500`

### GET `/api/v1/users`
What it does: Lists all users.

Auth: required, role `admin` only

Request body: none

Success response (`200`):

```json
[
  {
    "ID": 0,
    "Name": "string",
    "Email": "string",
    "Role": "string"
  }
]
```

Possible errors: `403`, `500`

---

## 3) Equipment Endpoints

### GET `/api/v1/equipment`
What it does: Lists equipment, optionally filtered by type/category.

Auth: none

Query params:
- `type` (optional)
- `category` (optional)

Request body: none

Success response (`200`):

```json
[
  {
    "ID": 0,
    "Name": "string",
    "Category": "string",
    "Description": "string",
    "Type": "string",
    "DailyRate": "string",
    "SalePrice": "string",
    "Quantity": 0,
    "CreatedAt": "2026-04-09T00:00:00Z",
    "UpdatedAt": "2026-04-09T00:00:00Z"
  }
]
```

Possible errors: `500`

### GET `/api/v1/equipment/:id`
What it does: Returns detailed information for one equipment item, including serials and available units.

Auth: none

Path params:
- `id` (required, integer > 0)

Request body: none

Success response (`200`):

```json
{
  "ID": 0,
  "Name": "string",
  "Category": "string",
  "Description": "string",
  "Type": "string",
  "DailyRate": "string",
  "SalePrice": "string",
  "Quantity": 0,
  "CreatedAt": "2026-04-09T00:00:00Z",
  "UpdatedAt": "2026-04-09T00:00:00Z",
  "AvailableUnits": 0,
  "Serials": ["string"]
}
```

Possible errors: `400`, `404`

### POST `/api/v1/equipment`
What it does: Creates new equipment and optional equipment units by serial numbers.

Auth: required, role `admin` or `manager`

Request body:

```json
{
  "Name": "string",
  "Category": "string",
  "Description": "string",
  "Type": "string",
  "DailyRate": 0,
  "SalePrice": 0,
  "Quantity": 0,
  "Serials": ["string"]
}
```

Success response (`201`):

```json
{
  "ID": 0,
  "Name": "string",
  "Category": "string",
  "Description": "string",
  "Type": "string",
  "DailyRate": "string",
  "SalePrice": "string",
  "Quantity": 0,
  "CreatedAt": "2026-04-09T00:00:00Z",
  "UpdatedAt": "2026-04-09T00:00:00Z"
}
```

Possible errors: `400`, `401`, `403`

### PUT `/api/v1/equipment/:id`
What it does: Updates equipment fields using partial payload (all fields optional).

Auth: required, role `admin` or `manager`

Path params:
- `id` (required, integer > 0)

Request body:

```json
{
  "Name": "string",
  "Category": "string",
  "Description": "string",
  "Type": "string",
  "DailyRate": 0,
  "SalePrice": 0,
  "Quantity": 0
}
```

Success response (`200`):

```json
{
  "ID": 0,
  "Name": "string",
  "Category": "string",
  "Description": "string",
  "Type": "string",
  "DailyRate": "string",
  "SalePrice": "string",
  "Quantity": 0,
  "CreatedAt": "2026-04-09T00:00:00Z",
  "UpdatedAt": "2026-04-09T00:00:00Z"
}
```

Possible errors: `400`, `401`, `403`

---

## 4) Rental Endpoints

### GET `/api/v1/rentals/availability`
What it does: Checks if at least one equipment unit is free for a time period.

Auth: none

Query params:
- `equipmentId` (required, int)
- `startAt` (required by intent, RFC3339)
- `endAt` (required, RFC3339)

Request body: none

Success response (`200`):

```json
{
  "EquipmentID": 0,
  "StartAt": "2026-04-09T00:00:00Z",
  "EndAt": "2026-04-10T00:00:00Z",
  "Available": true,
  "AvailableUnits": 0
}
```

Possible errors: `400`, `500`

Implementation note: current handler parses `startAt` from `endAt` query key, so both timestamps are read from `endAt`.

### POST `/api/v1/rentals/calculate`
What it does: Calculates rental amount by time window and mode (`day` default, or `hour`).

Auth: none

Request body:

```json
{
  "EquipmentId": 0,
  "StartAt": "2026-04-09T00:00:00Z",
  "EndAt": "2026-04-10T00:00:00Z",
  "Mode": "day"
}
```

Success response (`200`):

```json
{
  "EquipmentId": 0,
  "StartAt": "2026-04-09T00:00:00Z",
  "EndAt": "2026-04-10T00:00:00Z",
  "Mode": "day",
  "Amount": 0
}
```

Possible errors: `400`

### POST `/api/v1/rentals/book`
What it does: Reserves one available equipment unit for the authenticated customer.

Auth: required, role `customer`

Request body:

```json
{
  "EquipmentID": 0,
  "StartAt": "2026-04-09T00:00:00Z",
  "EndAt": "2026-04-10T00:00:00Z"
}
```

Success response (`201`):

```json
{
  "ReservationID": 0,
  "EquipmentId": 0,
  "EquipmentUnit": 0,
  "Status": "reserved",
  "StartAt": "2026-04-09T00:00:00Z",
  "EndAt": "2026-04-10T00:00:00Z",
  "EstimatedCost": 0
}
```

Possible errors: `400`, `401`, `403`

---

## 5) Order Endpoints

### POST `/api/v1/orders`
What it does: Creates a sale/rental/mixed order, order items, reservations (for rental items), and an invoice.

Auth: required, role `customer`

Request body:

```json
{
  "Items": [
    {
      "ItemType": "sale",
      "EquipmentID": 1,
      "Quantity": 2,
      "StartAt": null,
      "EndAt": null,
      "ReservationID": null
    },
    {
      "ItemType": "rental",
      "EquipmentID": 2,
      "Quantity": 1,
      "StartAt": "2026-04-09T00:00:00Z",
      "EndAt": "2026-04-10T00:00:00Z",
      "ReservationID": null
    }
  ]
}
```

Success response (`201`):

```json
{
  "ID": 0,
  "UserId": 0,
  "OrderType": "sale",
  "Status": "completed",
  "TotalAmount": 0,
  "CreatedAt": "2026-04-09T00:00:00Z",
  "Items": [
    {
      "ID": 0,
      "ItemType": "sale",
      "EquipmentID": 1,
      "EquipmentUnitID": null,
      "Quantity": 2,
      "UnitPrice": 0,
      "LineTotal": 0,
      "StartAt": null,
      "EndAt": null
    }
  ]
}
```

Possible errors: `400`, `401`, `403`

### GET `/api/v1/orders`
What it does: Lists orders. `customer` sees own orders; `admin/manager` see all orders.

Auth: required (`admin|manager|customer`)

Request body: none

Success response (`200`):

```json
[
  {
    "ID": 0,
    "UserId": 0,
    "OrderType": "sale",
    "Status": "completed",
    "TotalAmount": 0,
    "CreatedAt": "2026-04-09T00:00:00Z",
    "Items": null
  }
]
```

Possible errors: `401`, `500`

Note: current implementation returns order headers only in list output (no loaded `Items`).

### PATCH `/api/v1/orders/:id/status`
What it does: Updates order status and synchronizes rental reservation/unit states.

Auth: required, role `admin` or `manager`

Path params:
- `id` (required, integer > 0)

Request body:

```json
{
  "Status": "checked_out"
}
```

Allowed status values:
- `reserved`
- `checked_out`
- `returned`
- `completed`
- `cancelled`

Success response (`200`):

```json
{
  "ID": 0,
  "UserId": 0,
  "OrderType": "string",
  "Status": "checked_out",
  "TotalAmount": 0,
  "CreatedAt": "2026-04-09T00:00:00Z",
  "Items": null
}
```

Possible errors: `400`, `401`, `403`

### GET `/api/v1/orders/:id/invoice`
What it does: Returns invoice for an order. Customers can only access their own invoice; admin/manager can access all.

Auth: required (`admin|manager|customer`)

Path params:
- `id` (required, integer > 0)

Request body: none

Success response (`200`):

```json
{
  "OrderID": 0,
  "InvoiceNumber": "INV-20260409-000001",
  "Amount": 0,
  "InvoiceStatus": "issued",
  "IssuedAt": "2026-04-09T00:00:00Z"
}
```

Possible errors: `400`, `401`, `403`

---

## 6) Non-API Routes

### GET `/swagger`
What it does: Serves Swagger UI HTML.

Request body: none

Success response (`200`): HTML page

### GET `/docs/*`
What it does: Serves static OpenAPI docs files from `./docs` (for example `/docs/swagger.yaml`).

Request body: none

Success response (`200`): static file content
