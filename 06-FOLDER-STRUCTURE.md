# Required project folder structure

Keep `backend` and `frontend` at the repository root. Keep customer and admin screens/components separated in the frontend. Keep routes/controllers/models separated in the backend.

```text
food-ordering-website/
├── README.md
├── .gitignore
├── docs/
│   ├── 01-PRD.md
│   ├── 02-RULES.md
│   ├── 03-ARCHITECTURE.md
│   ├── 04-DESIGN.md
│   ├── 05-DATABASE-STRUCTURE.md
│   ├── 06-FOLDER-STRUCTURE.md
│   └── 07-API-CONTRACT.md
├── scripts/
│   └── download-unsplash-images.ps1
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Category.js
│       │   ├── Food.js
│       │   └── Order.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── authorize.js
│       │   ├── validate.js
│       │   └── errorHandler.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── foodController.js
│       │   ├── categoryController.js
│       │   ├── orderController.js
│       │   ├── adminUserController.js
│       │   └── adminOrderController.js
│       ├── services/
│       │   ├── checkoutService.js
│       │   └── orderStatusService.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── foodRoutes.js
│       │   ├── categoryRoutes.js
│       │   ├── orderRoutes.js
│       │   └── adminRoutes.js
│       ├── utils/
│       │   ├── createToken.js
│       │   └── createOrderNumber.js
│       ├── scripts/
│       │   ├── seedAdmin.js
│       │   └── seedData.js
│       ├── app.js
│       └── server.js
└── frontend/
    ├── .env.example
    ├── package.json
    ├── public/
    │   └── images/
    │       ├── IMAGE-SOURCES.md
    │       ├── burger.jpg
    │       ├── pizza.jpg
    │       ├── salad.jpg
    │       └── grilled-food.jpg
    └── src/
        ├── assets/
        ├── components/
        │   ├── common/
        │   ├── layout/
        │   └── food/
        ├── context/
        │   ├── AuthContext.jsx
        │   └── CartContext.jsx
        ├── services/
        │   └── api.js
        ├── hooks/
        ├── customer/
        │   ├── pages/
        │   └── components/
        ├── admin/
        │   ├── pages/
        │   └── components/
        ├── routes/
        │   └── AppRoutes.jsx
        ├── styles/
        │   ├── global.css
        │   └── variables.css
        ├── App.jsx
        └── main.jsx
```

## Folder ownership
- `customer/`: customer-facing pages and components only.
- `admin/`: admin dashboard pages and components only.
- `components/common/`: shared buttons, inputs, badges, modal, loaders.
- `services/`: frontend API calls.
- `models/`: MongoDB schemas.
- `services/` (backend): business rules that should not live inside HTTP controllers.
- `middleware/`: authentication, role checks, validation, and error handling.
- `scripts/`: trusted development seed scripts, never public endpoints.

Do not create a second frontend or backend folder for admin. Admin is a role and a section of the same application, not a separate technology stack.
