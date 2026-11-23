# Memory: Food Ordering Website (MERN)

> **Project Memory & Progress Tracker**  
> *Last Updated:* 2026-11-23  
> *Status:* Project Inception & Blueprint Setup  

---

## 1. Project Overview & Blueprint Summary
A single-store, beginner-friendly yet production-structured food ordering web application inspired by common food delivery flows (such as Foodmandu), built with a clean MERN stack.

### Key Personas & Roles:
- **Customer:**
  - Register, Login (JWT), View safe profile.
  - Browse food menu, search by name, filter by category.
  - View individual food item details (price in NPR, description, local image, availability).
  - Manage shopping cart (requires authentication: unauthenticated users are directed to login/signup to add items to cart).
  - Checkout with Cash on Delivery (COD), providing recipient name, phone, address, and optional instructions.
  - View order history and detailed order tracking with a timestamped status progression timeline.
  - Optional cancellation only when order is in `PLACED` state.
- **Admin:**
  - Secure admin login (credentials created via seed script / direct trusted DB operation, never public form).
  - Dashboard with summary metrics (total users, active foods, new orders, orders in progress).
  - View registered customers (safe details, never passwords/hashes).
  - Full CRUD on Food categories (safe delete or deactivate).
  - Full CRUD on Food items (soft-deactivate `isAvailable=false` if ordered before).
  - Order management: view all orders, filter by status/date, inspect order details & delivery info.
  - Advance order states along the authorized state machine (`CONFIRMED`, `PREPARING`, `PACKED`, `OUT_FOR_DELIVERY`, `DELIVERED`) or cancel with a clear reason.

---

## 2. Strict Technology Stack & Constraints

| Layer | Technology | Rules & Boundaries |
|---|---|---|
| **Frontend** | React (JavaScript), HTML5, CSS3 | Plain React + Vite. No TypeScript, Next.js, Redux, or Vue. |
| **Backend** | Node.js, Express.js (JavaScript) | REST API under `/api/v1`. Clean separation of routes, controllers, services, middleware, models. |
| **Database** | MongoDB + Mongoose | DB Name: `food_ordering`. No SQL, Firebase, Supabase. |
| **Auth** | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) | Work factor >= 10. Passwords never returned or stored in plaintext. JWT signed on server. |
| **Payment** | Cash on Delivery (COD) only | No third-party payment gateways, no fake mock card forms. |
| **Assets** | Local curated images | Stored in `frontend/public/images/`. No runtime reliance on external Unsplash URLs. |

---

## 3. Design System & Theme Specifications

### Color Tokens (Dark, warm, food-focused):
- **Background:** `#11100F` (Main page background)
- **Surface:** `#1B1917` (Cards, navbars, sidebars, panels)
- **Raised Surface:** `#25211E` (Input fields, hover surfaces, dropdowns)
- **Primary Accent:** `#F05A28` (Primary buttons, active indicators)
- **Accent Hover:** `#D9471B` (Interactive button hover)
- **Text:** `#F7F2EC` (Headings, primary body text)
- **Muted Text:** `#B6AAA0` (Secondary labels, metadata, captions)
- **Border:** `#3A332E` (Dividers, card outlines)
- **Success:** `#3E9B68` (Delivered status, confirmations)
- **Warning:** `#D99A35` (Preparing / attention status)
- **Danger:** `#D94A42` (Cancelled / destructive actions)

### Typography & UI Principles:
- Strong sans-serif system stack (`Inter, ui-sans-serif, system-ui, -apple-system, sans-serif`).
- High-contrast, bold headings, tabular numerals for currency (`NPR xxx`).
- Clear loading spinners/skeletons, empty states, and explicit error alerts.

---

## 4. Order State Machine & Rules

```
[PLACED] ───► [CONFIRMED] ───► [PREPARING] ───► [PACKED] ───► [OUT_FOR_DELIVERY] ───► [DELIVERED] (Terminal)
   │               │                │              │
   ▼               ▼                ▼              ▼
[CANCELLED]    [CANCELLED]      [CANCELLED]    [CANCELLED] (Terminal - requires cancellationReason)
```

- **Transitions:**
  - `PLACED → CONFIRMED` or `CANCELLED`
  - `CONFIRMED → PREPARING` or `CANCELLED`
  - `PREPARING → PACKED` or `CANCELLED`
  - `PACKED → OUT_FOR_DELIVERY` or `CANCELLED`
  - `OUT_FOR_DELIVERY → DELIVERED`
- **Customer Cancellation:** Allowed strictly while status is `PLACED`.
- **Snapshots:** Orders snapshot food item `name`, `image`, `unitPrice`, `quantity`, and `lineTotal` at the time of checkout so later menu price/item changes do not corrupt past orders.
- **Server-Side Integrity:** The client only sends `foodId` and `quantity`. The backend fetches authoritative prices and calculates line totals, subtotal, delivery fee, and grand total.

---

## 5. Database Schema Blueprint

### Collections & Schemas:
1. **User (`users`)**:
   - `name`: String (required, trimmed)
   - `email`: String (required, lowercase, unique index)
   - `phone`: String (optional)
   - `passwordHash`: String (required, `select: false`)
   - `role`: `"customer" | "admin"` (default `"customer"`)
   - `isActive`: Boolean (default `true`)
   - Timestamps: `createdAt`, `updatedAt`

2. **Category (`categories`)**:
   - `name`: String (required, trimmed)
   - `slug`: String (required, unique)
   - `description`: String
   - `image`: String (local path, e.g. `/images/category-pizza.jpg`)
   - `isActive`: Boolean (default `true`)
   - Timestamps: `createdAt`, `updatedAt`

3. **Food (`foods`)**:
   - `name`: String (required, trimmed)
   - `description`: String
   - `category`: ObjectId (`ref: 'Category'`, required)
   - `price`: Number (required, >= 0, NPR)
   - `image`: String (local path, e.g. `/images/burger.jpg`)
   - `isAvailable`: Boolean (default `true`)
   - `preparationTimeMinutes`: Number
   - Indexes: `{ category: 1, isAvailable: 1 }`
   - Timestamps: `createdAt`, `updatedAt`

4. **Order (`orders`)**:
   - `orderNumber`: String (unique human-readable ID, e.g. `FD-2026-000101`)
   - `user`: ObjectId (`ref: 'User'`, required)
   - `items`: Array of:
     - `food`: ObjectId (`ref: 'Food'`)
     - `name`: String (snapshot)
     - `image`: String (snapshot)
     - `unitPrice`: Number (snapshot)
     - `quantity`: Number (>= 1)
     - `lineTotal`: Number
   - `delivery`:
     - `recipientName`: String (required)
     - `phone`: String (required)
     - `address`: String (required)
     - `instructions`: String
   - `subtotal`: Number (recalculated by server)
   - `deliveryFee`: Number (server configured, e.g. 50 NPR)
   - `total`: Number (subtotal + deliveryFee)
   - `paymentMethod`: `"CASH_ON_DELIVERY"`
   - `paymentStatus`: `"PENDING" | "PAID" | "REFUNDED"` (default `"PENDING"`)
   - `status`: `"PLACED" | "CONFIRMED" | "PREPARING" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"`
   - `cancellationReason`: String
   - `statusHistory`: Array of `{ status, note, changedBy (ref User), changedAt }`
   - Indexes: `{ user: 1, createdAt: -1 }`, `{ status: 1, createdAt: -1 }`, `{ orderNumber: 1 }` (unique)
   - Timestamps: `createdAt`, `updatedAt`

---

## 6. Implementation Roadmap & Progress Tracker

### Legend:
- `[x]` Completed
- `[-]` In Progress
- `[ ]` Pending / Up Next

---

### Phase 1: Blueprint & Foundation Setup
- [x] Read and understand all blueprint specifications (`01-PRD.md` through `07-API-CONTRACT.md`).
- [x] Create centralized project `memory.md` tracker.
- [x] Establish repository organization (`docs/`, `.gitignore`, root structure).

---

### Phase 2: Backend Development (`/backend`)
- [x] Initialize Node.js Express application (`backend/package.json`).
- [x] Configure environment variables (`backend/.env.example` and `.env`).
- [x] Set up MongoDB connection (`src/config/db.js`).
- [x] Create Mongoose Models:
  - [x] `User.js`
  - [x] `Category.js`
  - [x] `Food.js`
  - [x] `Order.js`
- [x] Implement Middlewares:
  - [x] Authentication middleware (`auth.js` - JWT verification)
  - [x] Authorization middleware (`authorize.js` - Admin role check)
  - [x] Request validation middleware (`validate.js`)
  - [x] Central error handling middleware (`errorHandler.js`)
- [x] Implement Services & Utilities:
  - [x] `createToken.js` (JWT signing)
  - [x] `createOrderNumber.js` (Sequential/unique order numbers)
  - [x] `checkoutService.js` (Server-side price verification and total recalculation)
  - [x] `orderStatusService.js` (State machine transition validator)
- [x] Implement Controllers & Routes:
  - [x] Auth (`/api/v1/auth/register`, `/login`, `/me`)
  - [x] Public Foods & Categories (`/api/v1/foods`, `/api/v1/categories`)
  - [x] Customer Orders (`POST /api/v1/orders`, `GET /api/v1/orders/my`, `GET /api/v1/orders/:id`, `PATCH /api/v1/orders/:id/cancel`)
  - [x] Admin Management (`/api/v1/admin/dashboard`, `/users`, `/foods`, `/categories`, `/orders`, `/orders/:id/status`)
- [x] Write Seed Scripts:
  - [x] `seedAdmin.js` (Default admin: `admin@foodorder.com` / `AdminPassword123!`)
  - [x] `seedData.js` (Initial categories & foods with local image paths)
- [x] Test Backend Endpoints (Authentication, CRUD, Order placement, Status transitions).

---

### Phase 3: Frontend Development (`/frontend`)
- [x] Initialize React + Vite application (`frontend/package.json`).
- [x] Configure Design System CSS (`variables.css`, `global.css`) matching theme tokens.
- [x] Set up Image Assets in `frontend/public/images/` and local source references.
- [x] Build Services & Contexts:
  - [x] Axios/Fetch API service wrapper (`services/api.js`)
  - [x] `AuthContext.jsx` (User state, login, register, logout, token persistence)
  - [x] `CartContext.jsx` (Local cart state, add, change qty, remove, clear, calculations)
- [x] Build Common & Layout Components:
  - [x] Navbar (Logo, search, menu links, cart counter badge, user/admin menu)
  - [x] Footer
  - [x] Buttons, Form Inputs, Modal, Loader/Spinner, StatusBadge
  - [x] ProtectedRoute & AdminRoute guards
- [x] Customer Screens:
  - [x] Home / Menu Page (Hero banner, Category filter chips, Search bar, Food grid)
  - [x] Food Detail Page (Image, description, price, prep time, quantity selector, add to cart)
  - [x] Cart Page (List with quantities, subtotal, delivery fee, order summary, clear cart)
  - [x] Checkout Page (Delivery details form, Order summary, COD confirmation)
  - [x] My Orders Page (List with status badges and order summaries)
  - [x] Order Details & Tracking Page (Order breakdown, delivery info, timestamped timeline with 15s auto-polling)
- [x] Admin Dashboard & Management Screens:
  - [x] Admin Login Page (`/admin/login`)
  - [x] Admin Layout with Sidebar Navigation
  - [x] Dashboard Overview (Metric summary cards: Users, Foods, New Orders, Active Orders, Revenue)
  - [x] Food Items Management (Table, Add/Edit modal, toggle availability, soft delete)
  - [x] Categories Management (Table, Add/Edit modal, safe delete)
  - [x] Customer Users List (Safe view with order counts/dates)
  - [x] Orders Management (Filter by status, order detail view, status update actions, cancellation reason prompt)
- [x] App Routing setup (`AppRoutes.jsx`, `App.jsx`, `main.jsx`).

---

### Phase 4: Integration, Verification & End-to-End Testing
- [x] Run backend and frontend simultaneously with MongoDB.
- [x] Verify full customer order journey:
  - [x] Register new customer (`POST /api/v1/auth/register`).
  - [x] Browse menu, filter categories, search (`GET /api/v1/foods`).
  - [x] Add items to cart and check recalculations.
  - [x] Place COD order (`POST /api/v1/orders`).
  - [x] View order in My Orders (`GET /api/v1/orders/my`).
- [x] Verify full admin workflow:
  - [x] Login as admin (`POST /api/v1/auth/login`).
  - [x] Verify dashboard metrics (`GET /api/v1/admin/dashboard`).
  - [x] Confirm order (`PLACED → CONFIRMED`).
  - [x] Progress order (`CONFIRMED → PREPARING → PACKED → OUT_FOR_DELIVERY → DELIVERED`).
  - [x] Verify customer screen reflects updates in real-time or via 15s polling.
- [x] Test edge cases & security:
  - [x] Cannot manipulate price from browser (server recalculates all prices).
  - [x] Customer cannot access admin endpoints (returns 403 Forbidden).
  - [x] Customer cannot view another customer's order.
  - [x] Invalid order state transition rejected by backend.
  - [x] Customer cannot cancel a non-PLACED or DELIVERED order.

---

### Phase 5: Final Documentation & Launch Handover
- [x] Verify all PRD requirements and non-functional requirements are satisfied.
- [x] Update root `README.md` with complete execution instructions.
- [x] Update `memory.md` with final project state and handover summary.

---

## 7. Change Log & Activity Record

| Timestamp (Local) | Action / Milestone | Details |
|---|---|---|
| 2026-11-23 13:30 | Review Specifications | Examined all markdown specifications (`01-PRD.md` through `07-API-CONTRACT.md`). |
| 2026-11-23 13:35 | Project Memory Initialized | Created `memory.md` documenting tech stack, architecture, schemas, and roadmap. |
| 2026-11-23 13:40 | Backend Architecture Built | Implemented Express app, MongoDB connection, User/Category/Food/Order Mongoose models, JWT auth middleware, checkout service, order status transition service, and all REST controllers and routes. |
| 2026-11-23 13:45 | Database Seed Scripts | Built and executed `seedAdmin.js` (created default admin `admin@foodorder.com`) and `seedData.js` (seeded 4 categories and 10 foods with NPR pricing and local images). |
| 2026-11-23 13:50 | Frontend React App Built | Developed modern React SPA using Vite, CSS tokens (`#11100F` warm dark theme), AuthContext, CartContext, API service, Customer pages (Home, FoodDetail, Cart, Checkout, MyOrders, OrderDetails with live timeline), and Admin portal (Dashboard, Orders, Detail & Status updates, Foods, Categories, Users). |
| 2026-11-23 13:55 | Local Photography Setup | Downloaded curated high-quality food photography for burgers, pizzas, salads, and grills into `frontend/public/images/`. |
| 2026-11-23 14:00 | End-to-End Verification Passed | Ran automated test suite `testEndToEnd.js` verifying 10 critical workflows: auth, menu, pricing integrity, state machine transitions (`PLACED` to `DELIVERED`), COD settlement, and security boundaries. 100% passed. |
| 2026-11-23 14:18 | Cart Authentication Enforced | Added authentication requirement for adding items to the cart and accessing `/cart`. Unauthenticated users clicking "Add" or visiting `/cart` are guided to login or register with seamless return routing, and cart state is automatically sanitized upon logout. |

