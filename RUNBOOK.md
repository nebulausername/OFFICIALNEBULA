# OFFICIALNEBULA Runbook 🚀

## Prerequisites
- **Node.js**: v18+
- **Package Manager**: pnpm (recommended) or npm
- **Database**: PostgreSQL (Production) or SQLite (Dev default)

## 1. Setup
```bash
# Install dependencies
pnpm install
cd backend && pnpm install && cd ..
```

## 2. Environment
Ensure `.env` files are set up in root and `backend/`.
See `.env.example` if available.

## 3. Database Initialization
```bash
# Run migrations
cd backend
npx prisma migrate dev

# Seed Database (Critical for functional app!)
npm run db:seed
```

## 4. Development
```bash
# Start Backend (Port 8000)
cd backend
npm run dev

# Start Frontend (Port 3000/5173) (in separate terminal)
cd ..
pnpm dev
```

## 5. Verification & Testing
We have a suite of smoke tests to verify core logic:
```bash
cd backend
npm test
```
This runs:
- `verify_stock_logic.js`: Checks atomic stock decrement and cart transactions.
- `verify_user_update.js`: Checks admin user update capabilities.
- `verify_validation.js`: Checks server-side Zod validation.

## 6. Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Dashboard**: http://localhost:3000/admin (Login as admin user)

## Key Features Implemented
- **Shop**: Browse, Cart, Checkout with Stock Checks.
- **Admin**: Standardized Dashboard (Products, Orders, Users) with `ResourceTable`.
- **Security**: HttpOnly Cookies, Role-Based Access Control, Zod Validation.
- **Performance**: Request Logging, Compression, Rate Limiting.
