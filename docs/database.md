# Database

## Technology

PostgreSQL with Prisma ORM.

## Core Models

- **User** — platform admins, cafe owners, managers, staff
- **Cafe** — tenant record for each coffee shop
- **CafeSettings** — ordering toggles, opening hours
- **MenuCategory** — grouped sections within a cafe menu
- **MenuItem** — individual products with base price in cents
- **MenuItemOption** — option groups (Size, Milk, Extras, Sugar)
- **MenuItemOptionValue** — individual choices within an option group
- **CafeTable** — tables with unique QR tokens per cafe
- **Order** — order header with type, status, payment
- **OrderItem** — line items with snapshotted data

## Key Rules

- All money stored as **cents** (integer)
- Order items **snapshot** name/price/options so menu changes don't break history
- Every tenant-owned row has `cafeId`
- Migrations required for every schema change

## Seed Data

```bash
pnpm db:seed
```

Seeds: 1 platform admin, 1 demo cafe, 1 owner, 5 categories, 7 items with options, 10 tables.
