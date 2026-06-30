# Milson ERP - Development Plan

## Phase 1: Core ERP Modules

### Sprint 1: Foundation (Weeks 1-2)
- [x] Project setup (monorepo, tooling, linting)
- [x] Database schema design and migrations
- [x] Authentication system (JWT, bcrypt)
- [x] Role-based access control middleware
- [x] Audit trail middleware
- [x] Base API structure with error handling
- [x] Frontend scaffolding (React + Ant Design)
- [x] Login page and auth context
- [x] Main layout (sidebar, header, breadcrumbs)
- [x] Dashboard page

### Sprint 2: Master Data (Weeks 3-4)
- [x] Part Master module (CRUD + search)
- [x] Supplier module (CRUD + search)
- [x] Customer module (CRUD + search)
- [x] Pricing management (customer & supplier prices)
- [x] User management (Admin)

### Sprint 3: Order Management (Weeks 5-6)
- [x] Sales Orders (create, edit, line items, status flow)
- [x] Purchase Orders (create, edit, line items, status flow)
- [x] Order number auto-generation
- [x] Status workflow enforcement

### Sprint 4: Container & Inventory (Weeks 7-8)
- [x] Container tracking (create, add PO lines, status)
- [x] Purchase Receipt creation from containers
- [x] Inventory tracking (on-hand, allocated, on-order)
- [x] Inventory transactions log
- [x] Inventory adjustments

### Sprint 5: Integration & Deployment (Weeks 9-10)
- [ ] Xero OAuth 2.0 integration
- [ ] Push invoices to Xero from Sales Orders
- [ ] Push bills to Xero from Purchase Orders
- [ ] Push purchase receipts to Xero
- [x] Render deployment configuration
- [ ] Production deployment

## Phase 2: Future Enhancements (Planned)
- Shipping/logistics management
- Quality control / inspection records
- Document management (drawings, certifications)
- Reporting and analytics dashboard
- Email notifications (order confirmations, shipping alerts)
- Barcode/QR code for inventory
- Customer portal (order status, invoices)
- Xero two-way sync
