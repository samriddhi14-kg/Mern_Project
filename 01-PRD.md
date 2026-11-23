# Product Requirements Document (PRD)

## 1. Product summary
Build a straightforward food ordering website where customers can browse a menu, add meals to a cart, place an order, and see progress. An administrator manages menu items, customers, and orders from a separate admin panel.

The product is inspired by the basic ordering experience of Foodmandu, but this is an independent, single-store CRUD project. It is not a copy of Foodmandu's branding or proprietary design.

## 2. Goals
- Deliver a working end-to-end order flow.
- Keep the implementation beginner-friendly and maintainable.
- Separate customer and admin experiences.
- Ensure the customer sees status updates for their own order.
- Use only the specified MERN stack and JWT/bcrypt authentication.

## 3. Out of scope for version 1
Online payment gateway, live GPS tracking, delivery partner accounts, multiple restaurants, promo codes, reviews, chat, push notifications, inventory forecasting, and native mobile apps. Checkout can use Cash on Delivery as the only payment method; payment status is recorded but no payment is collected online.

## 4. User roles and permissions

### Customer
- Register, log in, log out.
- Browse active food items and categories.
- Search by food name and filter by category.
- View item details, price, description, and image.
- Add items to cart, change quantities, and remove items.
- Enter delivery name, phone, and address.
- Place an order using Cash on Delivery.
- View order list and details.
- See status and timestamped status history for their own orders.
- Cancel an order only while it is `PLACED` (optional simple rule; server enforced).

### Admin
- Log in through the admin login route.
- View dashboard counts: total users, active foods, new orders, and orders in progress.
- View customer list and customer details (never passwords or password hashes).
- Create, read, update, and delete food items.
- Prefer soft-deactivation (`isAvailable=false`) when an item has been ordered before; hard-delete only unused items.
- Create, read, update, and delete categories, subject to safe-use checks.
- View all orders and filter by status/date.
- Open an order and see items, quantities, customer contact, address, total, and history.
- Accept an order (`CONFIRMED`) or reject/cancel it with a reason.
- Update progress: `PREPARING`, `PACKED`, `OUT_FOR_DELIVERY`, `DELIVERED`.
- View a clear confirmation before destructive actions.

## 5. Main user journeys

### Customer order journey
1. Customer opens the home/menu page.
2. Customer browses or searches available foods.
3. Customer adds one or more items to the cart.
4. Cart displays quantity, unit price, line total, subtotal, delivery fee, and grand total.
5. Customer signs in (or registers) before checkout.
6. Customer provides delivery details and submits the order.
7. Backend validates item availability and recalculates all prices.
8. Order is created with status `PLACED`; cart is cleared only after successful creation.
9. Customer sees an order confirmation and can open order tracking.
10. As the admin changes the order status, the customer's order page reflects the latest status when refreshed or when polling runs.

### Admin order journey
1. Admin signs in.
2. Admin opens the orders queue and sees new `PLACED` orders.
3. Admin opens an order and checks the items and delivery details.
4. Admin confirms or cancels the order.
5. Admin updates the order as it is prepared, packed, dispatched, and delivered.
6. Every change is recorded in `statusHistory` with actor and timestamp.
7. The customer sees the updated status on their own order page.

## 6. Functional requirements
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-01 | Registration | Valid name/email/password creates a customer; duplicate email is rejected. |
| FR-02 | Login | Correct credentials return a JWT; incorrect credentials return a generic 401 message. |
| FR-03 | Role protection | Customer cannot access admin APIs; unauthenticated users cannot access protected APIs. |
| FR-04 | Menu | Only available foods appear in the public menu. |
| FR-05 | Cart | Quantity is at least 1; duplicate product adds increase quantity rather than duplicate lines. |
| FR-06 | Checkout | Server re-fetches food prices and availability and calculates total. |
| FR-07 | Order creation | A successful checkout creates an order with `PLACED` status and a snapshot of item names/prices. |
| FR-08 | Customer orders | Customer can list and view only their own orders. |
| FR-09 | Admin foods | Admin can create, read, update, and safely delete/deactivate food. |
| FR-10 | Admin users | Admin can list users without exposing password hashes. |
| FR-11 | Admin order updates | Admin can accept/cancel and progress orders using allowed status transitions. |
| FR-12 | Status visibility | Customer order details show current status and ordered status history. |
| FR-13 | Validation | Invalid IDs, quantities, prices, and missing fields receive useful 4xx responses. |
| FR-14 | Empty/error states | Pages show loading, empty, and error states instead of failing silently. |

## 7. Non-functional requirements
- Responsive layout for desktop, tablet, and mobile.
- Passwords are bcrypt-hashed.
- JWT secret is stored only in backend environment variables.
- API validates input and returns consistent JSON.
- Use Mongoose references and indexes appropriately.
- Do not expose secrets, stack traces, password hashes, or internal database errors.
- Use local image assets for food cards; no runtime dependency on remote image hosts.
- Basic accessibility: semantic HTML, labels, keyboard focus, readable contrast, alt text.

## 8. Success criteria for the first release
A customer can register, log in, add two foods to a cart, place a COD order, and see it in their account. An admin can log in, see the order, confirm it, set it to `PREPARING`, `PACKED`, `OUT_FOR_DELIVERY`, and `DELIVERED`; the customer sees each latest status and history. Admin can also manage food items and view users.
