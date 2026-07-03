# Architecture

## Overview

Multi-tenant SaaS platform built with Next.js App Router. Each cafe is a tenant isolated by `cafeId`. Public pages use slug-based routing; admin pages use session-based auth.

## Key Design Decisions

- **Tenant isolation**: Every tenant-scoped record includes `cafeId`. All queries filter by `cafeId`.
- **Server-side price calculation**: Cart prices are recalculated on the server; browser prices are never trusted.
- **Order item snapshots**: Item name, price, and options are stored at order time so historical orders remain readable after menu changes.
- **Money as cents**: All monetary values stored as integers (cents) to avoid floating-point precision issues.

## Routing

| Route | Purpose |
|-------|---------|
| `/` | SaaS landing page |
| `/cafe/[slug]` | Public cafe page |
| `/cafe/[slug]/order` | Customer ordering page |
| `/cafe/[slug]/order/checkout` | Checkout |
| `/cafe/[slug]/order/success` | Order confirmation |
| `/admin/login` | Staff/admin login |
| `/admin/dashboard` | Admin dashboard |
| `/admin/orders` | Live order queue |
| `/admin/menu` | Menu management |
| `/admin/tables` | Table/QR management |
| `/admin/settings` | Cafe settings |
| `/admin/reports` | Sales reports |
| `/admin/platform` | Platform admin (superadmin) |

## Data Flow

1. Customer scans QR → opens `/cafe/[slug]/order?tableToken=xxx`
2. Menu loaded server-side from PostgreSQL
3. Cart managed client-side (React state)
4. Order submitted to `POST /api/orders` → server validates + recalculates
5. Order stored in DB, appears in staff dashboard via polling
