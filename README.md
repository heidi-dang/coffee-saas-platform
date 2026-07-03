# Coffee Shop QR Ordering SaaS Platform

A multi-tenant SaaS platform that lets cafes run QR-based ordering. Customers scan a table QR code, browse the menu, customise items, and order — all from their phone. Staff see orders arrive in real-time on the admin dashboard.

Built with Next.js App Router, TypeScript, PostgreSQL, Prisma, and Tailwind CSS.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Forms | React Hook Form + Zod |
| Database | PostgreSQL 18 + Prisma ORM |
| Auth | JWT (bcryptjs) |
| Icons | lucide-react |
| Utilities | date-fns, clsx, tailwind-merge |
| Testing | Vitest (unit), k6 (load) |
| Process | PM2 (production) |
| CI | GitHub Actions |

## Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL 18 (local or Docker)
- A VPS (Vultr, DigitalOcean, etc.) for deployment

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your database URL and JWT secret

# 3. Generate Prisma client
pnpm prisma generate

# 4. Run migrations
pnpm prisma migrate dev

# 5. Seed demo data
pnpm db:seed

# 6. Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Login at `/admin/login` with demo credentials:

| Email | Password | Role |
|---|---|---|
| `owner@democoffee.com` | `password123` | Cafe Owner |
| `staff@democoffee.com` | `password123` | Cafe Staff |
| `admin@coffeeqr.app` | `password123` | Platform Admin |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | At least 32 characters for session signing |
| `APP_ENV` | Yes | `development`, `test`, or `production` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public base URL of the app |

See `.env.example` for the full list including Stripe keys (needed for Week 5+).

## Database

### Schema

10 models with tenant isolation via `cafeId` on every multi-tenant table:

- **User** — Platform admins, cafe owners, staff
- **Cafe** — Tenant (one per coffee shop)
- **CafeSettings** — Ordering toggles (dine-in, takeaway, pickup)
- **MenuCategory** — Grouped menu sections
- **MenuItem** — Products with price in integer cents
- **MenuItemOption** — Option groups (Size, Milk, Extras, Sugar)
- **MenuItemOptionValue** — Individual choices with optional price
- **CafeTable** — Tables with unique QR tokens
- **Order** — Orders with type, status, payment status
- **OrderItem** — Line items with snapshotted name/price/options

All prices stored in **cents** (integers). Server-side recalculation prevents price manipulation.

### Migrations

```bash
pnpm prisma migrate dev     # Development — creates migration files
pnpm prisma migrate deploy  # Production — applies pending migrations
pnpm db:seed                # Seeds demo data for local development
```

### Indexes

Migration `0002_add_core_indexes` adds 8 indexes and 2 unique constraints for:
- Order lookups by cafe, status, and order number
- Menu item availability filtering
- Table lookups by cafe
- User uniqueness by email

## Running Tests

```bash
# Unit tests (Vitest)
pnpm test

# All checks (CI equivalent)
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Current coverage: **46 tests** across 6 files — status machine, option validation, price calculation, auth guards, settings enforcement, duplicate detection.

### Load Testing

```bash
# Prerequisites: k6 installed, test server running on :3100

k6 run tests/load/customer-order-flow.js   # 50 menu users
k6 run tests/load/checkout-spike.js        # 20/50/100 simultaneous orders
k6 run tests/load/admin-orders-polling.js  # 5/10 admin polling screens
```

See [docs/load-testing.md](docs/load-testing.md) for full results.

## Project Structure

```
├── app/
│   ├── admin/           # Admin dashboard (protected)
│   ├── api/             # API routes
│   └── cafe/[slug]/     # Public customer pages
├── components/          # Reusable UI components
├── lib/
│   ├── api/             # Response helpers (ok, badRequest, handleAuthError, etc.)
│   ├── auth/            # Auth guards, role access, JWT helpers
│   ├── orders/          # Order creation pipeline, status machine, validation
│   └── generated/       # Prisma client (generated)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── unit/            # Vitest unit tests
│   └── load/            # k6 load test scripts
├── docs/
│   ├── load-testing.md
│   └── https-troubleshooting.md
├── scripts/             # Deployment scripts (test server)
└── ecosystem.config.js  # PM2 production config
```

## CI/CD

GitHub Actions runs on push to `dev`/`main` and pull requests:

1. Checkout
2. Setup pnpm + Node 22
3. `pnpm install --frozen-lockfile`
4. Wait for Postgres (service container)
5. `pnpm lint`
6. `pnpm typecheck`
7. `pnpm prisma generate`
8. `pnpm test`
9. `pnpm build`

CI must pass before merging. Configuration at `.github/workflows/ci.yml`.

## Deployment

### Test Server

The project includes scripts for deploying a test instance on port 3100:

```bash
./scripts/deploy-test-app.sh   # Build, migrate, seed, start
./scripts/stop-test-server.sh  # Stop test server
./scripts/check-test-server.sh # Health check
```

Test URL: `http://coffee-test.tnaprovider.com.au:80`

### Production

Deployed on a VPS (Vultr, Ubuntu 26.04, 2 vCPU, 4 GB RAM) with:

- **Reverse proxy**: Caddy v2.11 (auto-TLS via Cloudflare DNS)
- **Process manager**: PM2 with auto-restart (`ecosystem.config.js`)
- **Database**: PostgreSQL 18 (local)
- **Memory limit**: 1 GB (PM2 `max_memory_restart`)

```bash
# Production start
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Architecture Notes

- **Order concurrency**: Uses `pg_advisory_xact_lock` per cafeId to serialize order number generation inside Prisma transactions. No duplicate order numbers under concurrent load.
- **Connection pooling**: Prisma default pool (5 connections on 2-vCPU). Tested with 100 concurrent orders + 10 admin polls without exhaustion.
- **Query patterns**: Active-status scoped queries, index-backed lookups by cafeId. Admin polling uses 5-second intervals.

## Git Workflow

```
main ← dev ← feature/...
```

- No direct commits to `main`
- Feature branches merge into `dev`, then `dev` into `main`
- Commit format: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`

### Pre-commit Checklist

- [ ] `pnpm lint` — no errors
- [ ] `pnpm typecheck` — passes
- [ ] `pnpm test` — all pass
- [ ] `pnpm build` — succeeds
- [ ] Migration runs cleanly (if schema changed)
- [ ] No secrets committed

## Load Test Results

| Scenario | Users | Orders | Error Rate | p95 Response |
|---|---|---|---|---|
| Menu browsing | 50 | — | 0% | 57 ms |
| Checkout spike | 20 | 20 | 0% | — |
| Checkout spike | 50 | 50 | 0% | — |
| Checkout spike | 100 | 100 | 0% | 2.26 s |
| Admin polling (5 users) | 5 | — | 0% | — |
| Admin polling (10 users) | 10 | — | 0% | 207 ms |

0 duplicate order numbers across 231 total orders. Server stable for entire test duration (~10 min).

## Troubleshooting

See [docs/https-troubleshooting.md](docs/https-troubleshooting.md) for Caddy auto-TLS diagnostics.

Key issues resolved:
- Order number collision under concurrent load — fixed with `pg_advisory_xact_lock`
- MULTIPLE option validation incorrectly rejecting valid selections — fixed in `validate-order-options.ts`
- Unreachable `return serverError()` after `handleAuthError` — removed across 6 route files

## License

Proprietary — built for the Coffee Shop QR Ordering SaaS Platform.
