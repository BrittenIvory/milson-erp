---
name: testing-procurement-flow
description: End-to-end test the Milson ERP procurement-to-inventory workflow (login, part/supplier/PO, container receive, inventory, audit logs). Use when verifying ERP backend/frontend changes touching purchase orders, containers, inventory, or receiving.
---

# Testing Milson ERP — Procurement-to-Inventory Flow

## Environment setup (processes are killed on VM restart — re-run these)
- Backend: `cd server && npm start` (port 3001). Waits for PostgreSQL `milson_erp`.
- Frontend: `cd client && npm run dev` (port 5173).
- Verify both: `curl -s localhost:3001/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' -o /dev/null -w "%{http_code}"` should be 200; `curl -s localhost:5173 -o /dev/null -w "%{http_code}"` should be 200.
- Admin login: `admin` / `admin123`.
- Login response nests the token at `data.token` (not `token`).

## Data persistence note
PostgreSQL data persists across VM restarts, but the frontend session (localStorage token) is lost when the tab reloads and the browser may drop the maximized state. After any restart: re-maximize (`wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`) and re-login. Created records (parts, suppliers, POs) survive, so check existing data via API before re-creating (duplicate codes will error).

## Recording caveat
Screen recordings do NOT survive a VM/process restart — the recording is lost and cannot be resumed. If the environment is unstable, capture screenshots at every step as the primary evidence, and treat the recording as best-effort. Take a fresh screenshot after each meaningful UI action.

## Golden-path test sequence (all via UI)
1. Login → dashboard shows 11 menu items + "System Admin".
2. Parts → Add Part: TEST-001 / Gray Iron / 2.5 kg.
3. Suppliers → Add Supplier: SUP-IND / Mumbai Castings Ltd (Country defaults to India).
4. Purchase Orders → New PO: supplier SUP-IND, Add Line TEST-001 qty 100 @ 15.00 → line total auto-calcs to $1500.
5. Open PO → Change Status: Draft→Sent→Confirmed (each shows a toast).
6. Containers → New Container: CONT-2026-001, vessel, BOL, pick a future Expected Arrival date.
7. Open container → Add PO Lines (select PO, then PO line, qty 100) → "Line added"; then Receive Container → confirm Popconfirm → "Container received - Purchase receipt created and inventory updated". Status becomes Received; a Purchase Receipts section with REC-0001 appears.
8. Inventory → TEST-001 On Hand should be **exactly 100** (regression guard for the container-receive double-count bug — if it shows 200 the bug regressed). History shows Receipt +100.
9. Inventory → Adjust: type Adjustment, qty -5, reason. On Hand → 95. History shows both Receipt +100 and Adjustment -5.
10. Audit Logs → CREATE entries for Part/Supplier/PurchaseOrder/Container and UPDATE entries for PO status changes.

## Known issues (verify if fixed; do not treat as new regressions)
- Timestamps render as **"Invalid Date"** in the Inventory transaction-history modal and Audit Logs table. Records are otherwise correct; likely a date parse/format bug in `InventoryPage.jsx` history modal and `AuditLogsPage.jsx`.
- Audit Logs may show a duplicate Container "create" row (one with empty `{}` changes).

## Devin Secrets Needed
None — local dev uses hardcoded dev credentials (admin/admin123, DB milson/milson123). No external secrets required for this flow.
