# Repository Guidelines

## Stack

- Node.js with CommonJS JavaScript and Express 4; `body-parser` parses JSON request bodies.
- Browser UI uses HTML, CSS, and JavaScript from `public/`.
- Application data is stored in `data/db.json` through `lib/store.js`.

## Module map

### `routes/`

- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/orders.js` — order listing, lookup, placement, and cancellation endpoints.
- `routes/products.js` — product catalog and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.

### `lib/`

- `lib/coupons.js` — coupon lookup, validation, and discount calculation.
- `lib/dates.js` — date formatting, normalization, and fiscal-year calculation.
- `lib/inventory.js` — product lookup, sellable stock checks, stock updates, and inventory summary.
- `lib/invoice.js` — invoice figure calculation and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtering.
- `lib/pricing.js` — subtotal, discount, GST, and checkout total calculation.
- `lib/reports.js` — dashboard summary and invoice/order reconciliation.
- `lib/store.js` — synchronous JSON database reads, writes, structure defaults, and audit entries.
- `lib/tax.js` — item GST rate lookup and CGST/SGST splitting.

## Commands

- `npm start` — starts `server.js` on `PORT` or port 3000.
- `node --test` — runs Node's built-in test runner against tests in `test/`.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Order history sorts and filters calendar dates chronologically; Khata settlements parse and validate amounts numerically. Scope: `lib/orders.js` list logic, `lib/dates.js`, `lib/ledger.js`, and `routes/customers.js`.
