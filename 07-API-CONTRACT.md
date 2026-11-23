# REST API contract

Base path: `/api/v1`. All request/response bodies use JSON. Protected routes require `Authorization: Bearer <JWT>` unless the implementation deliberately uses secure HttpOnly cookies.

## Authentication
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create customer account |
| POST | `/auth/login` | Public | Customer/admin login |
| GET | `/auth/me` | Authenticated | Return current user's safe profile |

Registration body:
```json
{ "name": "A User", "email": "user@example.com", "password": "StrongPass123" }
```
Do not accept `role` in this body. Login returns a safe user object and access token (or sets a secure cookie, depending on the selected strategy).

## Public menu
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/foods` | Public | List available foods; supports `?search=` and `?category=` |
| GET | `/foods/:id` | Public | Food details |
| GET | `/categories` | Public | List active categories |

## Customer
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/orders` | Customer | Place order |
| GET | `/orders/my` | Customer | List own orders |
| GET | `/orders/:id` | Owner or admin | View one order |
| PATCH | `/orders/:id/cancel` | Owner | Optional cancellation while status is `PLACED` |

Order request:
```json
{
  "items": [
    { "foodId": "MONGODB_OBJECT_ID", "quantity": 2 }
  ],
  "delivery": {
    "recipientName": "A User",
    "phone": "98XXXXXXXX",
    "address": "Street, area, city",
    "instructions": "Call when outside"
  },
  "paymentMethod": "CASH_ON_DELIVERY"
}
```
The client must not send `price`, `subtotal`, `deliveryFee`, `total`, `status`, or `userId`. The backend calculates/sets these values.

## Admin
All endpoints below require both authentication and `role=admin`.
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/dashboard` | Summary counts |
| GET | `/admin/users?page=1&limit=20` | Paginated customer list |
| GET | `/admin/users/:id` | Safe customer details |
| GET | `/admin/foods` | All foods including unavailable |
| POST | `/admin/foods` | Create food |
| PATCH | `/admin/foods/:id` | Update food |
| DELETE | `/admin/foods/:id` | Delete unused food or deactivate ordered food |
| GET | `/admin/categories` | List categories |
| POST | `/admin/categories` | Create category |
| PATCH | `/admin/categories/:id` | Update category |
| DELETE | `/admin/categories/:id` | Delete only if safe; otherwise deactivate |
| GET | `/admin/orders?status=PLACED&page=1&limit=20` | Filter/list all orders |
| GET | `/admin/orders/:id` | Order details |
| PATCH | `/admin/orders/:id/status` | Accept/cancel/progress order |

Status update request:
```json
{
  "status": "OUT_FOR_DELIVERY",
  "note": "Handed to delivery staff"
}
```
The backend checks whether the requested transition is allowed and appends the history entry. Never expose an endpoint that lets the customer set arbitrary status.

## Error handling
- `400`: malformed request or invalid ID.
- `401`: missing/invalid/expired authentication.
- `403`: authenticated but not permitted.
- `404`: resource not found.
- `409`: duplicate email or conflicting state transition.
- `422`: validation error.
- `500`: generic server error; log details privately.

## Order status refresh
Version 1: customer order details fetch the order on page load and poll `GET /orders/:id` every 15–30 seconds while visible. Stop polling when the page is closed or order is terminal. WebSockets are intentionally not required.
