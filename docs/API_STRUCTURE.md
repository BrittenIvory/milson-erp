# Milson ERP - API Structure

Base URL: `/api/v1`

All endpoints return JSON. Protected endpoints require `Authorization: Bearer <token>` header.

## Authentication

| Method | Endpoint             | Description         | Access  |
| ------ | -------------------- | ------------------- | ------- |
| POST   | /auth/login          | Login, get JWT      | Public  |
| POST   | /auth/logout         | Logout              | Auth    |
| GET    | /auth/me             | Get current user    | Auth    |
| PUT    | /auth/change-password| Change password     | Auth    |

## Users (Admin only)

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| GET    | /users             | List users         |
| GET    | /users/:id         | Get user           |
| POST   | /users             | Create user        |
| PUT    | /users/:id         | Update user        |
| DELETE | /users/:id         | Deactivate user    |

## Parts

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| GET    | /parts             | List parts         |
| GET    | /parts/:id         | Get part           |
| POST   | /parts             | Create part        |
| PUT    | /parts/:id         | Update part        |
| DELETE | /parts/:id         | Deactivate part    |

## Suppliers

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | /suppliers           | List suppliers       |
| GET    | /suppliers/:id       | Get supplier         |
| POST   | /suppliers           | Create supplier      |
| PUT    | /suppliers/:id       | Update supplier      |
| DELETE | /suppliers/:id       | Deactivate supplier  |

## Customers

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | /customers           | List customers       |
| GET    | /customers/:id       | Get customer         |
| POST   | /customers           | Create customer      |
| PUT    | /customers/:id       | Update customer      |
| DELETE | /customers/:id       | Deactivate customer  |

## Sales Orders

| Method | Endpoint                          | Description                |
| ------ | --------------------------------- | -------------------------- |
| GET    | /sales-orders                     | List sales orders          |
| GET    | /sales-orders/:id                 | Get sales order + lines    |
| POST   | /sales-orders                     | Create sales order         |
| PUT    | /sales-orders/:id                 | Update sales order         |
| PUT    | /sales-orders/:id/status          | Update status              |
| DELETE | /sales-orders/:id                 | Cancel sales order         |
| POST   | /sales-orders/:id/push-to-xero    | Push invoice to Xero       |

## Purchase Orders

| Method | Endpoint                          | Description                |
| ------ | --------------------------------- | -------------------------- |
| GET    | /purchase-orders                  | List purchase orders       |
| GET    | /purchase-orders/:id              | Get PO + lines             |
| POST   | /purchase-orders                  | Create purchase order      |
| PUT    | /purchase-orders/:id              | Update purchase order      |
| PUT    | /purchase-orders/:id/status       | Update status              |
| DELETE | /purchase-orders/:id              | Cancel purchase order      |
| POST   | /purchase-orders/:id/push-to-xero | Push bill to Xero         |

## Containers

| Method | Endpoint                              | Description                   |
| ------ | ------------------------------------- | ----------------------------- |
| GET    | /containers                           | List containers               |
| GET    | /containers/:id                       | Get container + lines         |
| POST   | /containers                           | Create container              |
| PUT    | /containers/:id                       | Update container              |
| POST   | /containers/:id/lines                 | Add PO lines to container     |
| DELETE | /containers/:id/lines/:lineId        | Remove PO line from container |
| POST   | /containers/:id/receive               | Create receipt from container |

## Purchase Receipts

| Method | Endpoint                                  | Description                |
| ------ | ----------------------------------------- | -------------------------- |
| GET    | /purchase-receipts                        | List receipts              |
| GET    | /purchase-receipts/:id                    | Get receipt + lines        |
| POST   | /purchase-receipts                        | Create receipt             |
| POST   | /purchase-receipts/:id/push-to-xero       | Push receipt to Xero       |

## Inventory

| Method | Endpoint                       | Description                 |
| ------ | ------------------------------ | --------------------------- |
| GET    | /inventory                     | List inventory              |
| GET    | /inventory/:partId             | Get part inventory          |
| PUT    | /inventory/:partId/adjust      | Adjust inventory            |
| GET    | /inventory/transactions        | List transactions           |

## Audit Logs (Admin only)

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| GET    | /audit-logs        | List audit logs    |

## Pricing

| Method | Endpoint                         | Description            |
| ------ | -------------------------------- | ---------------------- |
| GET    | /customers/:id/prices            | Customer price list    |
| POST   | /customers/:id/prices            | Set customer price     |
| GET    | /suppliers/:id/prices            | Supplier price list    |
| POST   | /suppliers/:id/prices            | Set supplier price     |

## Dashboard

| Method | Endpoint           | Description                |
| ------ | ------------------ | -------------------------- |
| GET    | /dashboard/stats   | Summary stats              |
| GET    | /dashboard/recent  | Recent activity            |

## Common Query Parameters

All list endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (default: created_at)
- `order` - Sort direction: ASC or DESC (default: DESC)
- `search` - Full-text search across relevant fields

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [ ... ]
  }
}
```
