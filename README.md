# FoodHub — MERN Food Ordering Website

A complete, production-structured food ordering web application built strictly with the **MERN** stack (MongoDB, Express.js, React, Node.js). 

> **Project Memory & Specifications:** Tracked live in [memory.md](file:///c:/Users/Admin/Documents/first_task/Mern_project/memory.md) and specifications in [docs/](file:///c:/Users/Admin/Documents/first_task/Mern_project/docs/).

---

## 🛠️ Stack & Architecture
- **Frontend:** React (JavaScript, HTML5, CSS3) powered by Vite.
- **Backend:** Node.js, Express.js REST API under `/api/v1`.
- **Database:** MongoDB with Mongoose (`food_ordering`).
- **Auth:** JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`).
- **Payment Method:** Cash on Delivery (COD).
- **Design System:** Dark warm food palette (`#11100F`, `#F05A28` primary accent).

---

## 🚀 Quick Start Guide

### 1. Start MongoDB
Ensure MongoDB is running locally on port 27017:
```powershell
& "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "backend\data\db"
```

### 2. Seed Admin & Menu Data (Already Pre-seeded)
```powershell
cd backend
npm run seed:admin
npm run seed:data
```

### 3. Run Backend API Server
```powershell
cd backend
npm run dev
# Server running at http://localhost:5000 (API at http://localhost:5000/api/v1)
```

### 4. Run Frontend Client
In a separate terminal:
```powershell
cd frontend
npm run dev
# Frontend running at http://localhost:5173
```

---

## 🔑 Default Accounts

### Administrator Account
- **URL:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Email:** `admin@foodorder.com`
- **Password:** `AdminPassword123!`

### Customer Account
- Customers can sign up directly via the **Sign Up** page ([http://localhost:5173/register](http://localhost:5173/register)).
- Pre-seeded Test Customer:
  - **Email:** `customer@example.com`
  - **Password:** `Password123!`

---

## 📦 Order Lifecycle State Machine
```
[PLACED] ───► [CONFIRMED] ───► [PREPARING] ───► [PACKED] ───► [OUT_FOR_DELIVERY] ───► [DELIVERED] (Terminal)
   │               │                │              │
   ▼               ▼                ▼              ▼
[CANCELLED]    [CANCELLED]      [CANCELLED]    [CANCELLED] (Terminal with reason)
```

- Customer can cancel only while status is `PLACED`.
- Admin manages status transitions with staff notes and reason prompts.
- All ordered meals store immutable snapshots of unit prices, names, and images at purchase time.

---

## 🧪 Verification & Testing
Run the automated end-to-end integration test suite:
```powershell
cd backend
node src/scripts/testEndToEnd.js
```
Runs 10 verification steps verifying health check, public menu, registration, COD price calculation, order placement, admin login, metrics, full state progression to `DELIVERED`, and security boundaries (100% pass rate).
