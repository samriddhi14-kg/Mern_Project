# Project rules and implementation constraints

These rules are mandatory. If a requested feature conflicts with this document, follow this document unless the project owner changes it.

## 1. Strict technology stack
- Frontend: HTML5, CSS3, React (JavaScript).
- Backend: Node.js + Express.js (JavaScript).
- Database: MongoDB + Mongoose.
- Authentication: JWT (`jsonwebtoken`) and bcrypt (`bcryptjs` or `bcrypt`).
- Do not introduce TypeScript, Next.js, Vue, Angular, PHP, Laravel, Django, Flask, MySQL, PostgreSQL, Firebase, Supabase, or a second database.
- Use npm. Keep frontend and backend as separate applications.

## 2. Authentication and authorization
- Hash passwords using bcrypt with a work factor of 10 or higher.
- Never save or return a plain-text password.
- Never accept a role from public registration. Public registration always creates `customer`.
- Admin accounts are created through a controlled seed script or direct trusted database operation, not a public "become admin" form.
- Sign JWTs on the backend. Include only `userId` and `role` claims plus standard expiry metadata.
- Verify JWT in middleware for protected routes.
- Enforce role checks on the backend, not just by hiding frontend links.
- Use short-lived access tokens (e.g. 1 day for a student project); do not put JWT secrets in frontend environment variables.
- For production, prefer secure, HttpOnly, SameSite cookies with CSRF protection if using cookies. If using Authorization Bearer tokens, understand that browser storage is exposed to XSS; avoid unsafe HTML and never store sensitive data in localStorage.
- Logout must clear the client session/token. If using stateless JWT, document that logout does not invalidate a copied token until expiry; add a token revocation strategy only if required.

## 3. API and data rules
- MongoDB is the source of truth.
- The frontend must never decide final prices or order totals.
- Checkout accepts food IDs and quantities only; backend fetches current food records and calculates prices.
- Order items store snapshots of food name, image path, unit price, and quantity so past orders remain readable after menu edits.
- Validate ObjectIds, strings, email, phone, quantities, status values, and request body shape.
- Use `isAvailable=false` instead of deleting food that appears in past orders.
- Never allow a customer to update another user's order or change their own order status.
- Every admin status update creates a status-history entry.
- Do not accept arbitrary MongoDB operators from user input; whitelist fields.
- Use pagination for admin user/order lists.
- Return consistent errors; do not send raw stack traces to clients.

## 4. Order state rules
Allowed statuses:
`PLACED`, `CONFIRMED`, `PREPARING`, `PACKED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.

Allowed transitions:
- `PLACED → CONFIRMED` or `CANCELLED`
- `CONFIRMED → PREPARING` or `CANCELLED`
- `PREPARING → PACKED` or `CANCELLED`
- `PACKED → OUT_FOR_DELIVERY` or `CANCELLED`
- `OUT_FOR_DELIVERY → DELIVERED`
- `DELIVERED` and `CANCELLED` are terminal.

Only admin can move an order through the normal workflow. Customer cancellation, if implemented, is allowed only from `PLACED`. A rejected order is represented as `CANCELLED` with a clear `cancellationReason`; do not add a confusing second `REJECTED` status.

## 5. Frontend rules
- React components should be small and reusable.
- Keep API calls in a shared API/service layer, not scattered through components.
- Keep cart state in a React Context or another simple React state solution; do not add Redux for this scope.
- Show loading, empty, success, and error states.
- Protect admin routes in the UI for usability, but backend middleware remains authoritative.
- Do not hardcode menu items, users, or order statuses as production data; seed data is for development only.

## 6. Code quality and Git rules
- Use clear names and one responsibility per module.
- Keep `.env`, secrets, `node_modules`, build output, and logs out of Git.
- Include `.env.example` files with placeholder values only.
- Use meaningful commits and test the full customer-to-admin order flow before declaring completion.
- Never claim the website is complete until the acceptance criteria in the PRD pass.
