# MongoDB database structure

Use MongoDB with Mongoose. Database name for local development: `food_ordering`.

## 1. Collections and relationships
- `users`: customer and admin accounts.
- `categories`: food categories.
- `foods`: menu items.
- `orders`: checkout records with immutable item snapshots.

Relationship overview:
- A food references one category.
- An order references one user.
- An order embeds its ordered item snapshots and status history.
- User documents do not embed all orders; query orders by `user`.

## 2. User
```js
{
  _id: ObjectId,
  name: String,                 // required, trimmed
  email: String,                // required, lowercase, unique index
  phone: String,                // optional at registration
  passwordHash: String,         // required, select: false
  role: "customer" | "admin",   // default customer
  isActive: Boolean,            // default true
  createdAt: Date,
  updatedAt: Date
}
```
Never return `passwordHash` in API responses. Public registration must ignore/reject any submitted `role`.

## 3. Category
```js
{
  _id: ObjectId,
  name: String,                 // required
  slug: String,                 // required, unique
  description: String,
  image: String,                // local path e.g. /images/category-pizza.jpg
  isActive: Boolean,            // default true
  createdAt: Date,
  updatedAt: Date
}
```

## 4. Food
```js
{
  _id: ObjectId,
  name: String,                 // required
  description: String,
  category: ObjectId,           // ref: Category
  price: Number,                // required, >= 0, NPR
  image: String,                // local path
  isAvailable: Boolean,         // default true
  preparationTimeMinutes: Number,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ category: 1, isAvailable: 1 }`, text index on `name` if search requires it.

## 5. Order
```js
{
  _id: ObjectId,
  orderNumber: String,          // unique human-readable ID
  user: ObjectId,               // ref: User
  items: [{
    food: ObjectId,             // ref: Food, may later be deleted
    name: String,               // snapshot at purchase time
    image: String,              // snapshot path
    unitPrice: Number,          // snapshot price in NPR
    quantity: Number,           // integer >= 1
    lineTotal: Number
  }],
  delivery: {
    recipientName: String,
    phone: String,
    address: String,
    instructions: String
  },
  subtotal: Number,
  deliveryFee: Number,
  total: Number,
  paymentMethod: "CASH_ON_DELIVERY",
  paymentStatus: "PENDING" | "PAID" | "REFUNDED",
  status: "PLACED" | "CONFIRMED" | "PREPARING" | "PACKED" |
          "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED",
  cancellationReason: String,
  statusHistory: [{
    status: String,
    note: String,
    changedBy: ObjectId,        // ref: User
    changedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ user: 1, createdAt: -1 }`, `{ status: 1, createdAt: -1 }`, unique `{ orderNumber: 1 }`.

## 6. Example order document
```json
{
  "orderNumber": "FD-2026-000123",
  "user": "ObjectId(customer)",
  "items": [
    {
      "food": "ObjectId(food)",
      "name": "Chicken Burger",
      "image": "/images/burger.jpg",
      "unitPrice": 320,
      "quantity": 2,
      "lineTotal": 640
    }
  ],
  "delivery": {
    "recipientName": "Customer Name",
    "phone": "98XXXXXXXX",
    "address": "House, street, area, city",
    "instructions": "Call on arrival"
  },
  "subtotal": 640,
  "deliveryFee": 50,
  "total": 690,
  "paymentMethod": "CASH_ON_DELIVERY",
  "paymentStatus": "PENDING",
  "status": "PLACED",
  "statusHistory": [
    {
      "status": "PLACED",
      "note": "Order placed by customer",
      "changedBy": "ObjectId(customer)",
      "changedAt": "2026-11-23T07:30:00.000Z"
    }
  ]
}
```

## 7. Data integrity notes
- Store prices as numbers in NPR; format as `NPR 320` in the UI.
- Use server-side validation and Mongoose schema validation.
- Normalize email to lowercase before saving.
- Use unique indexes for email, category slug, and order number.
- Generate order numbers safely; handle duplicate-key errors and retry.
- Snapshot item names/prices/images at checkout so old orders do not change when menu data changes.
- Consider MongoDB transactions only if checkout later requires multiple related writes. For this single order insert, keep the flow simple.
