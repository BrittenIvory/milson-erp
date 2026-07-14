# Milson ERP - Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ AUDIT_LOGS : creates
    ROLES ||--o{ USERS : has
    ROLES ||--o{ ROLE_PERMISSIONS : has
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : has

    PARTS ||--o{ SALES_ORDER_LINES : "ordered in"
    PARTS ||--o{ PURCHASE_ORDER_LINES : "purchased in"
    PARTS ||--o{ INVENTORY : "stocked as"
    PARTS ||--o{ INVENTORY_TRANSACTIONS : "tracked in"
    PARTS ||--o{ CUSTOMER_PRICES : "priced for"
    PARTS ||--o{ SUPPLIER_PRICES : "costed from"
    PARTS ||--o{ PART_CUSTOMERS : "identified by"
    PARTS ||--o{ PART_SUPPLIERS : "sourced from"
    PARTS ||--o{ PART_DOCUMENTS : "documented by"
    PARTS ||--o{ PART_PATTERNS : "tooled by"

    CUSTOMERS ||--o{ SALES_ORDERS : places
    CUSTOMERS ||--o{ CUSTOMER_PRICES : "has pricing"
    CUSTOMERS ||--o{ PART_CUSTOMERS : "uses part number"

    SUPPLIERS ||--o{ PURCHASE_ORDERS : "receives"
    SUPPLIERS ||--o{ SUPPLIER_PRICES : "has pricing"
    SUPPLIERS ||--o{ PART_SUPPLIERS : "supplies part"

    SALES_ORDERS ||--o{ SALES_ORDER_LINES : contains

    PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_LINES : contains

    PURCHASE_ORDER_LINES ||--o{ CONTAINER_LINES : "grouped in"
    CONTAINERS ||--o{ CONTAINER_LINES : contains
    CONTAINERS ||--o{ PURCHASE_RECEIPTS : "received as"

    PURCHASE_RECEIPTS ||--o{ PURCHASE_RECEIPT_LINES : contains
    PURCHASE_ORDER_LINES ||--o{ PURCHASE_RECEIPT_LINES : "received in"

    USERS {
        int id PK
        string username UK
        string email UK
        string password_hash
        string first_name
        string last_name
        int role_id FK
        boolean is_active
        timestamp last_login
        timestamp created_at
        timestamp updated_at
    }

    ROLES {
        int id PK
        string name UK
        string description
        timestamp created_at
        timestamp updated_at
    }

    PERMISSIONS {
        int id PK
        string module
        string action
        timestamp created_at
        timestamp updated_at
    }

    ROLE_PERMISSIONS {
        int id PK
        int role_id FK
        int permission_id FK
    }

    PARTS {
        int id PK
        string part_number UK
        string description
        string revision
        string status
        string material
        decimal weight
        decimal finished_weight
        string weight_unit
        string casting_process
        string hts_code
        string country_of_origin
        decimal safety_stock
        decimal reorder_point
        int lead_time_days
        decimal cost
        decimal selling_price
        string drawing_number
        string unit_of_measure
        text notes
        boolean is_active
        int created_by FK
        int updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    PART_CUSTOMERS {
        int id PK
        int part_id FK
        int customer_id FK
        string customer_part_number
        string customer_description
        decimal annual_usage
        timestamp created_at
        timestamp updated_at
    }

    PART_SUPPLIERS {
        int id PK
        int part_id FK
        int supplier_id FK
        decimal standard_cost
        char currency
        int lead_time_days
        decimal minimum_order_quantity
        boolean preferred_supplier
        timestamp created_at
        timestamp updated_at
    }

    PART_DOCUMENTS {
        int id PK
        int part_id FK
        string file_name
        string file_type
        string file_path
        timestamp upload_date
        timestamp created_at
        timestamp updated_at
    }

    PART_PATTERNS {
        int id PK
        int part_id FK
        string pattern_number
        string pattern_owner
        string pattern_location
        string pattern_status
        decimal pattern_cost
        timestamp created_at
        timestamp updated_at
    }

    SUPPLIERS {
        int id PK
        string name
        string code UK
        string contact_person
        string email
        string phone
        string address_line1
        string address_line2
        string city
        string state
        string country
        string postal_code
        int payment_terms
        text notes
        boolean is_active
        string xero_contact_id
        int created_by FK
        int updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    CUSTOMERS {
        int id PK
        string name
        string code UK
        string contact_person
        string email
        string phone
        string address_line1
        string address_line2
        string city
        string state
        string country
        string postal_code
        int payment_terms
        decimal credit_limit
        text notes
        boolean is_active
        string xero_contact_id
        int created_by FK
        int updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    CUSTOMER_PRICES {
        int id PK
        int customer_id FK
        int part_id FK
        decimal price
        date effective_date
        date expiry_date
        timestamp created_at
        timestamp updated_at
    }

    SUPPLIER_PRICES {
        int id PK
        int supplier_id FK
        int part_id FK
        decimal cost
        date effective_date
        date expiry_date
        timestamp created_at
        timestamp updated_at
    }

    SALES_ORDERS {
        int id PK
        string order_number UK
        int customer_id FK
        date order_date
        date required_date
        string status
        string shipping_address
        text notes
        decimal total_amount
        string xero_invoice_id
        int created_by FK
        int updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    SALES_ORDER_LINES {
        int id PK
        int sales_order_id FK
        int part_id FK
        int line_number
        decimal quantity
        decimal unit_price
        decimal line_total
        text notes
        timestamp created_at
        timestamp updated_at
    }

    PURCHASE_ORDERS {
        int id PK
        string po_number UK
        int supplier_id FK
        date order_date
        date expected_date
        string status
        string shipping_method
        text notes
        decimal total_amount
        string xero_bill_id
        int created_by FK
        int updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    PURCHASE_ORDER_LINES {
        int id PK
        int purchase_order_id FK
        int part_id FK
        int line_number
        decimal quantity
        decimal unit_cost
        decimal line_total
        decimal quantity_received
        text notes
        timestamp created_at
        timestamp updated_at
    }

    CONTAINERS {
        int id PK
        string container_number UK
        string description
        date expected_arrival_date
        date actual_arrival_date
        string status
        string vessel_name
        string bill_of_lading
        text notes
        int created_by FK
        int updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    CONTAINER_LINES {
        int id PK
        int container_id FK
        int purchase_order_line_id FK
        decimal quantity
        timestamp created_at
        timestamp updated_at
    }

    PURCHASE_RECEIPTS {
        int id PK
        string receipt_number UK
        int container_id FK
        date receipt_date
        int received_by FK
        text notes
        string xero_bill_id
        int created_by FK
        int updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    PURCHASE_RECEIPT_LINES {
        int id PK
        int purchase_receipt_id FK
        int purchase_order_line_id FK
        int part_id FK
        decimal quantity_received
        text notes
        timestamp created_at
        timestamp updated_at
    }

    INVENTORY {
        int id PK
        int part_id FK
        decimal quantity_on_hand
        decimal quantity_allocated
        decimal quantity_on_order
        decimal reorder_point
        decimal reorder_quantity
        string location
        date last_count_date
        timestamp created_at
        timestamp updated_at
    }

    INVENTORY_TRANSACTIONS {
        int id PK
        int part_id FK
        string transaction_type
        decimal quantity
        string reference_type
        int reference_id
        text notes
        int created_by FK
        timestamp created_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string entity_type
        int entity_id
        jsonb old_values
        jsonb new_values
        string ip_address
        timestamp created_at
    }
```

## Table Details

### Part Master Structure

- `parts.id` is the database representation of PartID.
- `created_at` and `updated_at` are the Created Date and Modified Date fields.
- `lead_time_days` stores lead time in calendar days.
- Child tables use internal `id` primary keys so each part can have multiple customer, supplier, document, and pattern records.
- `part_customers.customer_id` and `part_suppliers.supplier_id` link each mapping to the existing customer and supplier masters.
- Deleting a part cascades to its Part Customer, Part Supplier, Part Document, and Part Pattern records.
- Deleting a customer or supplier cascades only to its associated Part Customer or Part Supplier mappings.
- At most one Part Supplier row may be marked preferred for each part.

### Part Master Foreign Keys

- `part_customers.part_id` → `parts.id` (`ON UPDATE CASCADE`, `ON DELETE CASCADE`)
- `part_customers.customer_id` → `customers.id` (`ON UPDATE CASCADE`, `ON DELETE CASCADE`)
- `part_suppliers.part_id` → `parts.id` (`ON UPDATE CASCADE`, `ON DELETE CASCADE`)
- `part_suppliers.supplier_id` → `suppliers.id` (`ON UPDATE CASCADE`, `ON DELETE CASCADE`)
- `part_documents.part_id` → `parts.id` (`ON UPDATE CASCADE`, `ON DELETE CASCADE`)
- `part_patterns.part_id` → `parts.id` (`ON UPDATE CASCADE`, `ON DELETE CASCADE`)

### Status Enums

**Sales Order Status:** Draft, Confirmed, In Progress, Shipped, Delivered, Cancelled

**Purchase Order Status:** Draft, Sent, Confirmed, Partially Received, Received, Cancelled

**Container Status:** Pending, In Transit, At Port, Customs, Arrived, Received

### Indexes

- `users`: username, email, role_id
- `parts`: part_number (unique), status, hts_code, country_of_origin
- `part_customers`: (part_id, customer_id) (unique), (customer_id, customer_part_number)
- `part_suppliers`: (part_id, supplier_id) (unique), supplier_id, part_id where preferred_supplier = true (unique partial)
- `part_documents`: (part_id, file_path) (unique), file_type
- `part_patterns`: (part_id, pattern_number) (unique), pattern_status, pattern_owner
- `suppliers`: code
- `customers`: code
- `sales_orders`: order_number, customer_id, status
- `sales_order_lines`: sales_order_id, part_id
- `purchase_orders`: po_number, supplier_id, status
- `purchase_order_lines`: purchase_order_id, part_id
- `containers`: container_number, status
- `container_lines`: container_id, purchase_order_line_id
- `purchase_receipts`: receipt_number, container_id
- `purchase_receipt_lines`: purchase_receipt_id, purchase_order_line_id
- `inventory`: part_id (unique)
- `inventory_transactions`: part_id, transaction_type
- `audit_logs`: entity_type, entity_id, user_id, created_at
- `customer_prices`: customer_id, part_id
- `supplier_prices`: supplier_id, part_id
