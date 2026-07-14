# Milson ERP - User Roles & Permissions

## Roles

### 1. Admin
Full access to all modules and system configuration.
- Manage users and roles
- Access all modules (CRUD)
- View audit logs
- System configuration
- Xero integration management

### 2. Sales
Manages customer relationships and sales orders.
- Parts: Read
- Customers: Full CRUD
- Customer Prices: Full CRUD
- Sales Orders: Full CRUD
- Inventory: Read (check availability)

### 3. Purchasing
Manages supplier relationships, purchase orders, and container tracking.
- Parts: Full CRUD
- Suppliers: Full CRUD
- Supplier Prices: Full CRUD
- Purchase Orders: Full CRUD
- Containers: Full CRUD
- Purchase Receipts: Read
- Inventory: Read

### 4. Warehouse
Manages inventory and receiving.
- Parts: Read
- Containers: Read, Update (mark arrived)
- Purchase Receipts: Full CRUD
- Inventory: Full CRUD (adjustments, counts)

### 5. Viewer
Read-only access to all modules for reporting and oversight.
- All modules: Read only
- No create, update, or delete permissions

## Permission Matrix

| Module            | Admin | Sales | Purchasing | Warehouse | Viewer |
| ----------------- | ----- | ----- | ---------- | --------- | ------ |
| Users             | CRUD  | -     | -          | -          | -      |
| Roles             | CRUD  | -     | -          | -          | -      |
| Parts             | CRUD  | R     | CRUD       | R          | R      |
| Suppliers         | CRUD  | -     | CRUD       | R          | R      |
| Supplier Prices   | CRUD  | -     | CRUD       | -          | R      |
| Customers         | CRUD  | CRUD  | -          | R          | R      |
| Customer Prices   | CRUD  | CRUD  | -          | -          | R      |
| Sales Orders      | CRUD  | CRUD  | R          | R          | R      |
| Purchase Orders   | CRUD  | R     | CRUD       | R          | R      |
| Containers        | CRUD  | R     | CRUD       | RU         | R      |
| Purchase Receipts | CRUD  | -     | R          | CRUD       | R      |
| Inventory         | CRUD  | R     | R          | CRUD       | R      |
| Audit Logs        | R     | -     | -          | -          | -      |
| Dashboard         | R     | R     | R          | R          | R      |

**Legend:** C = Create, R = Read, U = Update, D = Delete
