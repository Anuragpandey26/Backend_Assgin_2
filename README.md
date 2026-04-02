# Finance Dashboard Backend

An enterprise-grade, modular, and secure finance dashboard backend built with Node.js, Express, and Prisma. This project features a robust Role-Based Access Control (RBAC) system, real-time audit logging, automated data seeding, and comprehensive unit/integration testing.

## 1. Description
The Finance Dashboard Backend is designed to manage personal or organizational finances. It provides APIs for tracking income/expenses, managing budgets, generating financial reports (PDF/CSV), and visualizing data through dashboard summaries.

**Key Features:**
- **Secure Authentication**: JWT-based auth with Refresh Token rotation and session revocation.
- **Granular RBAC**: Role-based permissions (Admin, Analyst, Viewer) controlling access to every endpoint.
- **Audit Logging**: Tracks every critical action (Login, Create, Update, Delete) for security compliance.
- **Data Engineering**: Support for CSV import/export and PDF report generation.
- **Production Ready**: Includes rate limiting, security headers (Helmet), and standardized error handling.

## 2. System Design
The application follows a **Modular Layered Architecture** to ensure high maintainability and scalability.

### Layers:
1.  **Routes**: Entry points defined for each module.
2.  **Validators (Zod)**: Schema-based validation for all incoming requests (body, query, params).
3.  **Controllers**: Handles HTTP request/response logic and delegates to services.
4.  **Services**: Contains the core business logic and interacts with the database.
5.  **DTOs (Data Transfer Objects)**: Standardizes and sanitizes outgoing data for the client.
6.  **Database (Prisma)**: Abstracted database layer with type-safe queries.

### Security Design:
- **Middleware-based protection**: `authMiddleware` verifies JWTs, while `roleMiddleware` checks permissions.
- **Token Blacklisting**: Revoked access tokens are stored in the database to prevent reuse.
- **Graceful Shutdown**: Safely closes database connections on process termination.

## 3. Technology Stack & Packages
- **Core**: Node.js (ESM), Express.js
- **ORM**: Prisma with PostgreSQL
- **Validation**: Zod
- **Security**: jsonwebtoken, bcryptjs, helmet, cors, express-rate-limit
- **Utilities**: date-fns, pdfkit, json2csv, multer (file uploads)
- **Testing**: Vitest, Supertest

## 4. Folder Structure
```text
/src
  /config           # App constants and permission definitions
  /db               # Prisma client, seeding, and DB configuration
  /dto              # Data Transfer Objects for sanitizing client output
  /error-handlers   # Global, JWT, and 404 error handlers
  /middlewares      # Shared middlewares (Auth, RBAC, Rate-limiting, Validation)
  /modules          # Feature-based modular directories
    /auth           # Signup, Login, Refresh, Logout, Revoke
    /finance        # Financial records (Income/Expense)
    /budget         # Personal budgeting and progress tracking
    /dashboard      # Summary statistics and visualizations
    /reports        # PDF/CSV Import and Export
    /user           # Admin user management and roles
    /audit          # System-wide action logging
    /intelligence   # Financial forecasting and AI-ready logic
  /utils            # Shared helper functions (JWT, PDF, Forecast, etc.)
  /tests            # Comprehensive unit and integration tests
  app.js            # Express application configuration
  server.js         # Server entry point
```

## 5. Project Setup

### Prerequisites:
- Node.js v18+
- PostgreSQL database

### Installation:
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# Seed the database with dummy data (Admin, Analyst, Viewer)
npm run db:seed
```

### Environment Variables (`.env` example):
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"
JWT_SECRET="your-super-secret-key-at-least-32-chars"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="30d"
```

## 6. API Documentation

### Authentication (`/api/v1/auth`)
- `POST /signup` - Register a new user
- `POST /login` - Login and get access/refresh tokens
- `POST /refresh` - Rotate refresh token to get a new access token
- `POST /logout` - Invalidate current session and blacklist tokens
- `POST /revoke-all` - Globally sign out of all devices

### Finance Records (`/api/v1/finance`)
- `GET /` - List records (Analyst sees own; Admin sees all)
- `POST /` - Create a new income/expense record
- `PATCH /:id` - Update a record (Admin only)
- `DELETE /:id` - Soft delete a record (Admin only)

### Budgets (`/api/v1/budgets`)
- `GET /` - View all budgets with actual spending progress
- `POST /` - Set or update a budget for a category
- `DELETE /:id` - Remove a budget

### Dashboard & Analytics (`/api/v1/dashboard`, `/api/v1/intelligence`)
- `GET /dashboard/summary` - Get high-level totals and category breakdown
- `GET /intelligence/forecasting` - Get financial trends and projections

### Reports (`/api/v1/reports`)
- `GET /export/csv` - Export financial data to CSV
- `GET /export/pdf` - Export summary report to PDF
- `POST /import` - Bulk upload records via CSV

### Admin Only (`/api/v1/users`, `/api/v1/audit`)
- `GET /users/analysts` - List all system analysts with status filters
- `PATCH /users/:id/role` - Update user permissions
- `PATCH /users/:id/status` - Activate/Deactivate users
- `GET /audit` - View system-wide audit logs
