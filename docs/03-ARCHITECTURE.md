# System architecture

## 1. Overview
Use a simple client-server architecture:

`React browser app → Express REST API → Mongoose → MongoDB`

The browser never connects directly to MongoDB. The backend owns authentication, permissions, validation, pricing, order creation, and status transitions.

## 2. Applications
### Frontend (`frontend/`)
- React single-page application.
- Public pages: Home/Menu, Food Details, Login, Register.
- Customer pages: Cart, Checkout, My Orders, Order Details.
- Admin pages: Admin Login, Dashboard, Foods, Categories, Users, Orders, Order Details.
- Shared components: Navbar, Footer, FoodCard, StatusBadge, ProtectedRoute, AdminRoute, Loading, ErrorMessage.
- React Context: AuthContext and CartContext.

### Backend (`backend/`)
- Express app exposes `/api/v1`.
- Routes map URLs to controllers.
- Controllers handle HTTP input/output.
- Services contain business logic (checkout, totals, order transitions).
- Mongoose models define MongoDB collections.
- Middleware verifies JWT, checks role, validates requests, and handles errors.

## 3. Suggested request flow
### Login
1. React sends email and password to `POST /api/v1/auth/login`.
2. Express validates input.
3. User is found by normalized email.
4. bcrypt compares the submitted password with `passwordHash`.
5. Server signs JWT with `JWT_SECRET` and expiry.
6. Client stores the session according to the selected token strategy.
7. Protected requests send `Authorization: Bearer <token>`.

### Checkout
1. React sends delivery details and cart lines (`foodId`, `quantity`).
2. Auth middleware identifies the customer.
3. Checkout service validates each ID and quantity.
4. Service fetches current food records from MongoDB.
5. Service rejects unavailable items and calculates item totals, subtotal, delivery fee, and grand total.
6. Service creates an order with item snapshots and initial `PLACED` history entry.
7. API returns the created order.
8. Client clears the cart only after a successful response.

### Admin status update
1. Admin UI calls `PATCH /api/v1/admin/orders/:id/status`.
2. JWT middleware authenticates the user; role middleware requires `admin`.
3. Service checks the transition against the allowed transition map.
4. Service updates `status`, appends `statusHistory`, and saves.
5. Customer's order details page fetches the updated order. A simple polling interval (e.g. every 15–30 seconds while the page is open) is sufficient for version 1. No sockets are required.

## 4. API response convention
Success:
```json
{ "success": true, "message": "Order created", "data": {} }
```
Error:
```json
{ "success": false, "message": "A useful error message", "errors": [] }
```
Use correct HTTP codes: 200, 201, 400, 401, 403, 404, 409, 422, 500.

## 5. Environment variables
### Backend `.env.example`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/food_ordering
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
DELIVERY_FEE=50
```
Use MongoDB Atlas URI instead if deploying with Atlas. Never commit the real `.env`.

### Frontend `.env.example`
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```
This assumes Vite is used only as the React development/build tool; it does not change the required React/Node/Express/MongoDB stack. Do not put secrets in `VITE_` variables.

## 6. Development commands (target setup)
Backend:
```bash
cd backend
npm install
npm run dev
```
Frontend:
```bash
cd frontend
npm install
npm run dev
```
Use a root README to document actual scripts once package files are created. The frontend dev server and backend API run separately.

## 7. Deployment shape
- Build React frontend and deploy its static output to a static hosting provider.
- Deploy Express backend to a Node-compatible hosting provider.
- Use MongoDB Atlas for hosted database.
- Configure `CLIENT_URL`, `MONGODB_URI`, and `JWT_SECRET` in the backend host environment.
- Configure `VITE_API_BASE_URL` at frontend build time.
- Configure CORS for the exact frontend origin.
- Store uploaded food images in a persistent object/file storage service if admin image uploads are added. For this simple first version, use curated local images in `frontend/public/images/`.
