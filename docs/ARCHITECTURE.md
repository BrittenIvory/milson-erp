# Milson ERP - System Architecture

## Overview

Milson ERP is a cloud-based Enterprise Resource Planning system built for Milson Foundry, a casting importer and distributor based in Michigan. The company imports castings from India and sells castings and wear parts to OEM manufacturers and agricultural equipment companies.

## Technology Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Frontend     | React 18 + Vite + Ant Design 5    |
| Backend      | Node.js + Express 4               |
| Database     | PostgreSQL 15                      |
| ORM          | Sequelize 6                        |
| Auth         | JWT (jsonwebtoken + bcrypt)        |
| API          | RESTful JSON                       |
| Hosting      | Render (Web Service + PostgreSQL)  |
| Integration  | Xero API (invoices, bills, receipts) |

## Architecture Diagram

```
                    +-----------------------+
                    |     Browser (React)   |
                    |   Ant Design UI       |
                    +-----------+-----------+
                                |
                           HTTPS/REST
                                |
                    +-----------v-----------+
                    |   Render Web Service  |
                    |   (Express API)       |
                    |                       |
                    |  +-- Auth Middleware   |
                    |  +-- RBAC Middleware   |
                    |  +-- Audit Logger     |
                    |  +-- Validation       |
                    +-----------+-----------+
                                |
                   +------------+------------+
                   |                         |
          +--------v--------+     +----------v--------+
          |   PostgreSQL    |     |    Xero API        |
          |   (Render)      |     |    (OAuth 2.0)     |
          +-----------------+     +--------------------+
```

## Application Structure

```
milson-erp/
  server/                    # Backend API
    src/
      config/                # DB, auth, Xero config
      controllers/           # Request handlers
      middleware/             # Auth, RBAC, audit, validation
      models/                # Sequelize models
      routes/                # Express route definitions
      seeders/               # Seed data (roles, admin user)
      utils/                 # Helpers (pagination, error handling)
      app.js                 # Express app setup
      server.js              # Entry point
    package.json
  client/                    # Frontend SPA
    src/
      components/            # Reusable UI components
      context/               # React context (auth, app state)
      hooks/                 # Custom hooks
      layouts/               # Page layouts (sidebar, header)
      pages/                 # Module pages
      services/              # API client functions
      utils/                 # Formatters, validators
      App.jsx
      main.jsx
    package.json
    vite.config.js
  docs/                      # Documentation
  render.yaml                # Render deployment blueprint
```

## Key Design Decisions

### 1. No Accounting Module
Milson Foundry uses Xero for accounting. The ERP pushes:
- **Invoices** (from Sales Orders) to Xero
- **Bills** (from Purchase Orders) to Xero
- **Purchase Receipts** to Xero

### 2. Audit Trail
Every create, update, and delete operation is logged to an `audit_logs` table with:
- User who performed the action
- Entity type and ID
- Old and new values (JSON diff)
- Timestamp and IP address

### 3. Role-Based Access Control (RBAC)
Five predefined roles with granular module-level permissions:
- **Admin** - Full system access
- **Sales** - Customers, Sales Orders, Parts (read)
- **Purchasing** - Suppliers, Purchase Orders, Containers, Parts (read)
- **Warehouse** - Inventory, Container Receipts, Parts (read)
- **Viewer** - Read-only access to all modules

### 4. Container Tracking Workflow
1. Create Purchase Orders to suppliers
2. Group PO lines from multiple POs into a Container
3. Set expected arrival date on the Container
4. When container arrives, create a Purchase Receipt from the Container
5. Receipt updates inventory quantities automatically

### 5. Deployment on Render
- **Web Service**: Node.js backend serving the React frontend (static build)
- **PostgreSQL**: Managed database on Render
- Single-service deployment (API serves static frontend files in production)

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens with 8-hour expiration
- CORS configured for allowed origins
- Rate limiting on auth endpoints
- Input validation on all endpoints
- SQL injection prevention via Sequelize parameterized queries
- No secrets in client-side code
