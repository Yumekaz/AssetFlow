# AssetFlow — Enterprise Asset & Resource Management System

AssetFlow is a centralized, production-grade enterprise resource planning (ERP) platform designed for tracking, allocating, booking, and auditing physical assets and shared resources within an organization. 

Prepared originally as a target deliverable for the **Odoo Hackathon 2026**, the system enforces strict relational integrity, concurrent transaction protections, and role-scoped operational gating.

---

## 📅 System Architecture & Technical Stack

AssetFlow is built as a single-tenant monolith with strict separation of concerns, ensuring high reliability, speed of execution, and robust data consistency under load:

```mermaid
graph TD
    Client[React + Vite Frontend] <-->|Proxy API Requests| Server[Node.js + Express Backend]
    Server <-->|Prisma Client| Database[(PostgreSQL Database)]
    Server -->|Server-Sent Events| Client
```

### 💻 Frontend
* **Core Framework**: React 18, Vite, TypeScript.
* **Styling**: Tailwind CSS v4, utilizing a customized premium glassmorphic UI, high-contrast dark-mode panels, and ambient mesh highlights.
* **Component Architecture**: Modular page components and reusable utility hooks, ensuring atomic UI design.

### ⚙️ Backend
* **Core Engine**: Node.js, Express (REST API), TypeScript.
* **Database & ORM**: PostgreSQL, Prisma ORM, utilizing raw transaction isolation queries to control database state transitions.
* **Security & Auth**: Stateless JWT-based session tokens with role-based route guard middlewares.
* **Live Notifications**: Real-time push updates powered by Server-Sent Events (SSE).

---

## 🔒 Security, Authorization, and Gating (RBAC Matrix)

AssetFlow implements strict server-side Role-Based Access Control (RBAC) checked at the API middleware layer. Frontend screens are dynamically adjusted based on the verified JWT payload:

| Action | Admin | Asset Manager | Department Head | Employee |
| :--- | :---: | :---: | :---: | :---: |
| Manage departments/categories | ✅ | ❌ | ❌ | ❌ |
| Promote/demote user roles | ✅ | ❌ | ❌ | ❌ |
| Register assets | ✅ | ✅ | ❌ | ❌ |
| Direct asset allocation | ✅ | ✅ | ❌ | ❌ |
| Approve transfer requests | ✅ | ✅ | ✅ (dept-scoped) | ❌ |
| Request asset transfers | ✅ | ✅ | ✅ | ✅ |
| Book shared resource | ✅ | ✅ | ✅ | ✅ |
| Approve maintenance tickets | ✅ | ✅ | ❌ | ❌ |
| Raise maintenance tickets | ✅ | ✅ | ✅ | ✅ |
| Create/close audit cycles | ✅ | ❌ | ❌ | ❌ |
| Perform assigned audits | ✅ | ✅ | ✅ | ✅ (if assigned) |
| View organizational analytics | ✅ | ✅ | ❌ (dept only) | ❌ (self only) |

### Key Security Policies Enforced:
1. **Signup Integrity**: The signup API payload enforces the lowest privilege (`Employee`) role server-side, preventing client-injected role escalation attacks.
2. **Role Promotion Gating**: Role promotions can only be triggered by an Admin from the secure Employee Directory page.
3. **Audit Isolation**: Auditors can only scan assets and view cycles they are assigned to, while creating/closing cycles is restricted to Administrators.
4. **SSE Authorization**: Server-Sent Events require JWT token query parameter verification to prevent telemetry eavesdropping.

---

## 🛠️ Data Model & Business Rules

The relational schema implements clean indexing, self-referential relations, and foreign keys across all core models:

```mermaid
erDiagram
    Department ||--o{ Employee : has
    Department ||--o{ Department : parent
    AssetCategory ||--o{ Asset : categorizes
    Asset ||--o{ Allocation : tracks
    Asset ||--o{ Booking : reserves
    Asset ||--o{ MaintenanceRequest : service
    AuditCycle ||--o{ AuditItem : contains
    Asset ||--o{ AuditItem : Audited
    Employee ||--o{ Allocation : holds
    Employee ||--o{ Booking : books
```

### Core Business Logic:
* **The Asset State Machine**: Enforces strict transitions: `Available` ➔ `Allocated` ➔ `Under Maintenance` ➔ `Lost` ➔ `Retired` ➔ `Disposed`.
* **Allocation and Bookings**: Kept strictly mutually exclusive per asset. Shared resources are bookable-only (`is_bookable: true`), while stationary equipment is allocatable-only.
* **Double-Booking Prevention**: Reserving overlapping time-slots is blocked using strict interval inequality logic. Concurrency race conditions are prevented using the `Serializable` transaction isolation level. Touching time boundaries (e.g., booking `10:00–11:00` when `9:00–10:00` exists) are accepted.
* **Audit Discrepancies**: Closing an audit cycle generates a locked discrepancy log. Missing items transition to `Lost`; damaged items generate automatic high-priority maintenance tickets.
* **Maintenance Restoration**: Resolving a maintenance ticket automatically transitions the asset back to its active holder (if it had a prior holder) or resets it to `Available`.

---

## ⚙️ Local Development Setup

### Prerequisites
* **Node.js** (v18+)
* **Docker** (to spin up the local PostgreSQL engine)

### 1. Install & Scaffold Environment
Clone the project and create a `.env` file in the `backend/` directory:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/assetflow?schema=public"
JWT_SECRET="your_jwt_secret_key"
```

### 2. Startup local PostgreSQL Container
Launch the database container defined in the root directory:
```bash
docker-compose up -d
```

### 3. Run Backend Migrations & Seed Data
Install backend dependencies, execute prisma schema migrations, and seed mock ERP organization data:
```bash
cd backend
npm install
npx prisma migrate dev
npm run seed
```
The database is pre-populated with:
* **Admin Account**: `admin@assetflow.com` / `password123`
* **Department Head**: `sarah@assetflow.com` / `password123`
* **Employee**: `mike@assetflow.com` / `password123`
* **Assets**: 30 assets (MacBooks, projectors, desks) with pre-configured allocations, bookings, and audits.

Start the backend:
```bash
npm run dev
```

### 4. Startup Frontend Client
Navigate to the frontend directory, install dependencies, and start the Vite dev server:
```bash
cd ../frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173/` to log in and test the system.
