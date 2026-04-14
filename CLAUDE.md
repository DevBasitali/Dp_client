Replace the contents of client/CLAUDE.md completely
with this:

# CLAUDE.md — Dollar Point Frontend

## Stack
Next.js (App Router) + TypeScript + Tailwind + shadcn/ui

## Commands
Run from client/:
  npm run dev      # dev server on port 3000
  npm run build    # production build
  npx tsc --noEmit # type check only

## Folder Structure
client/
├── src/
│   └── app/
│       ├── (app)/          ← owner screens (sidebar layout)
│       ├── branch-dashboard/ ← branch manager screens
│       ├── vendor-portal/   ← vendor screens
│       ├── super-admin/     ← super admin screens
│       ├── login/           ← regular login
│       └── signup/          ← owner signup
├── components/              ← shared UI components
└── lib/                     ← api helpers, utilities

## API
Base URL: NEXT_PUBLIC_API_URL from .env
All requests need: Authorization: Bearer <token>
Token managed by Zustand store (dp-auth-storage)
  Accessed via useAuthStore() hook
  Axios interceptor attaches it automatically
On 401: clear token + redirect to /login

## Auth
Token payload: { userId, role, branchId, vendorId, ownerId }
Role routing after login:
  owner          → /dashboard
  branch_manager → /branch-dashboard
  vendor         → /vendor-portal
  super_admin    → /super-admin/dashboard (uses sa_token)

## Roles
owner          → (app)/ folder — full sidebar
branch_manager → branch-dashboard/ folder
vendor         → vendor-portal/ folder
super_admin    → super-admin/ folder (separate layout)

## Key Conventions
- Use shadcn/ui components
- Money format: Rs. 1,25,000 (always with Rs. prefix)
- Primary color: #1B2A4A (Dark Navy)
- Accent color: #F0A500 (Gold)
- Always use TypeScript — no any types
- Always handle loading + error + empty states
- Toast notifications for success/error
- Never hardcode API URLs — always use NEXT_PUBLIC_API_URL

## Backend Routes Available
POST   /auth/login
POST   /auth/logout
GET    /auth/me
POST   /auth/signup
POST   /auth/super-admin-login
GET|POST        /users
GET|PUT         /users/:id
GET|POST        /branches
GET|PUT         /branches/:id
GET|POST        /vendors
GET|PUT         /vendors/:id
GET             /vendors/:id/items
GET             /vendors/:id/orders
GET|POST        /items
GET|PUT         /items/:id
POST|GET        /vendor-orders
GET             /vendor-orders/:id
GET|POST        /daily-closings
GET             /daily-closings/summary
PUT             /daily-closings/:id
GET|POST        /monthly-closings
GET             /monthly-closings/:id
GET             /cal-box
GET             /cal-box/:branchId
GET             /vendor-ledger/:vendorId
POST            /vendor-ledger/inventory
POST            /vendor-ledger/payment
GET             /vendor-ledger/outstanding
GET             /dashboard/owner
GET|POST        /super-admin/dashboard
GET|POST        /super-admin/owners
PUT             /super-admin/owners/:id/approve
PUT             /super-admin/owners/:id/ban
PUT             /super-admin/owners/:id/unban
POST            /super-admin/super-admins