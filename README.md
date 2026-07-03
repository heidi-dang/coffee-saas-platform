# Coffee Shop QR Ordering SaaS Platform

A multi-tenant SaaS platform that lets cafes and coffee shops run their own QR-based ordering system. Each cafe gets a public menu page, QR-coded tables, a live order dashboard, and optional online payment — all within a single platform.

Built for cafe owners, staff, and their customers.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| Database | PostgreSQL + Prisma ORM |
| Cache (optional) | Redis |
| Payments | Stripe (first), Square (later) |
| Icons | lucide-react |
| Utilities | date-fns, clsx, tailwind-merge |

## Features by Phase

### Phase 1 — MVP
- Public cafe website per tenant
- QR-based ordering page with table tokens
- Menu with categories, items, and customisation (size, milk, extras, sugar, notes)
- Client-side cart with server-side price recalculation
- Order submission (dine-in, takeaway, pickup)
- Pay at counter option
- Staff/admin login with role-based access
- Live order dashboard with status lanes (New → Accepted → Preparing → Ready → Completed → Cancelled)
- Menu management (CRUD categories, items, option groups)
- Table and QR code management with PNG download
- Basic order status updates

### Phase 1.5 — Admin Website Builder / Design Studio

The platform will include a controlled WYSIWYG-style Website Builder inside the admin area so café owners can redesign their public café website without needing a developer.

This feature should be added after the core ordering flow is stable.

#### Goal

Allow café owners to edit their public café landing page from the admin dashboard. They should be able to change:

- Logo
- Hero image
- Hero title
- Hero subtitle
- Button text
- Button link
- Brand colour
- Accent colour
- Background colour
- Font preset
- About section
- Gallery images
- Announcement banner
- Opening hours text
- Footer text
- Social links
- Menu item photos

#### Admin Routes

Planned routes:

```
/admin/website-builder
/admin/developer/design-studio
```

Both routes can load the same Design Studio page.

#### Editing Scope

The Website Builder should only edit the public café landing page first:

```
/cafe/[slug]
```

It must not allow customers to redesign these pages in the MVP:

```
/admin/*
/cafe/[slug]/order/*
/cafe/[slug]/order/checkout
/cafe/[slug]/order/success
payment pages
API routes
```

Ordering, checkout, payment, and admin pages must remain stable.

#### Recommended Build Approach

Use a controlled block editor first, not a full unrestricted code editor.

MVP Design Studio should support:

- Template preset selection
- Theme colour editing
- Logo upload
- Hero image upload
- Hero text editing
- Section show/hide
- Section ordering
- Gallery image management
- Save draft
- Preview
- Publish
- Reset to default

Later, advanced WYSIWYG support can be added with:

- Tiptap for rich text sections
- GrapesJS for advanced drag-and-drop campaign pages

#### Planned Database Models

The feature will add:

- `CafeTheme`
- `CafePageSection`
- `CafeMedia`

These models will store published design settings, draft design settings, page sections, and uploaded media.

#### Publish Flow

Changes must follow this flow:

```
Draft → Preview → Publish
```

Public pages should use the published design only. Draft changes must not affect the live café website until the owner clicks Publish.

#### Access Rules

MVP access:

| Role | Can edit website design |
|------|------------------------|
| PLATFORM_ADMIN | Yes — all cafés |
| CAFE_OWNER | Yes — own café |
| CAFE_MANAGER | Yes — own café |
| CAFE_STAFF | No |

#### Recommended Timeline

The Design Studio should not block the core QR ordering product.

Recommended order:

| Week | Focus |
|------|-------|
| 2 | Customer ordering |
| 3 | Admin orders, menu, tables, QR generation |
| 4 | Website Builder MVP |
| 5 | Stripe payment |
| 6 | SaaS billing |

#### Done Definition

The Design Studio feature is done only when:

- Admin website builder page exists
- Café owner can edit theme
- Café owner can change photos
- Café owner can manage page sections
- Draft save works
- Preview works
- Publish works
- Public café page renders published design
- Menu item photos can be changed
- Staff cannot edit website design
- Ordering flow is not broken
- Lint passes
- Typecheck passes
- Build passes

### Phase 2 — Online Payment
- Stripe Checkout Session integration
- Payment webhook (checkout.session.completed, expired, payment_failed)
- Paid / unpaid / failed / refunded order status
- Refund tracking
- Receipt email (optional)

### Phase 3 — SaaS Business Platform
- Subscription billing for cafe owners (Stripe)
- Owner onboarding
- Plan limits (Starter / Professional / Premium)
- Tenant dashboard
- Custom subdomain support
- White-label settings
- Platform admin dashboard (view/suspend cafes, manage subscriptions, platform revenue)

### Phase 4 — Premium Features
- Kitchen Display Screen
- Receipt printer support
- Sales reports
- Staff roles (CAFE_MANAGER, CAFE_STAFF)
- Discounts / coupons
- Customer accounts
- Loyalty points
- Square POS integration
- Multi-location support

## User Roles

| Role | Capabilities |
|------|-------------|
| **Platform Admin** | View all cafes, manage subscriptions, suspend cafes, view platform revenue, system settings |
| **Cafe Owner** | Manage cafe profile, menu, opening hours, tables/QR codes, orders, reports, staff accounts |
| **Cafe Staff** | View incoming orders, change order status, print dockets, view active order queue |
| **Customer** | Scan QR code, browse menu, add items to cart, place order, pay online or at counter, track order status |

## Repository Structure

```
coffee-qr-platform/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   └── cafe/[slug]/
│   │       ├── page.tsx
│   │       ├── order/
│   │       │   ├── page.tsx
│   │       │   ├── checkout/page.tsx
│   │       │   └── success/page.tsx
│   │       └── ...
│   ├── (admin)/
│   │   └── admin/
│   │       ├── login/page.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── orders/page.tsx
│   │       ├── menu/page.tsx
│   │       ├── tables/page.tsx
│   │       ├── settings/page.tsx
│   │       └── reports/page.tsx
│   └── api/
│       ├── orders/route.ts
│       ├── menu/route.ts
│       ├── tables/route.ts
│       ├── payments/stripe/
│       │   ├── checkout/route.ts
│       │   └── webhook/route.ts
│       └── qr/route.ts
├── components/
│   ├── public/
│   ├── admin/
│   ├── cart/
│   ├── menu/
│   ├── orders/
│   └── layout/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── stripe.ts
│   ├── tenant.ts
│   ├── permissions.ts
│   ├── money.ts
│   ├── qr.ts
│   └── validations.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
│   ├── logos/
│   └── qr/
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── deployment.md
│   ├── testing.md
│   ├── admin-guide.md
│   └── customer-flow.md
├── .github/workflows/ci.yml
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

## Local Setup

### Prerequisites
- Node.js 22+
- pnpm 10+
- Docker (for local PostgreSQL)

### Step 1: Create project

```bash
pnpm create next-app coffee-qr-platform
cd coffee-qr-platform
```

Enable TypeScript, ESLint, Tailwind CSS, App Router, and import aliases.

### Step 2: Install core packages

```bash
pnpm add @prisma/client zod react-hook-form @hookform/resolvers
pnpm add stripe qrcode date-fns clsx tailwind-merge
pnpm add lucide-react
pnpm add -D prisma tsx
```

### Step 3: Install UI components

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input textarea select dialog table badge tabs dropdown-menu form sheet toast
```

### Step 4: Set up Prisma

```bash
pnpm prisma init
```

### Step 5: Start local database

```bash
docker compose up -d
```

### Step 6: Run migrations and seed

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
pnpm db:seed
```

## Environment Variables

```env
DATABASE_URL="postgresql://coffee_user:coffee_password@localhost:5432/coffee_qr_platform"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
EMAIL_FROM=""
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
```

See `.env.example` for the full list.

## Database

### Core Models
- **User** — platform admins, cafe owners, managers, staff
- **Cafe** — tenant (each coffee shop is one cafe)
- **CafeSettings** — ordering toggles, opening hours
- **MenuCategory** — grouped menu sections
- **MenuItem** — products with price in cents
- **MenuItemOption** — option groups (size, milk, extras)
- **MenuItemOptionValue** — individual choices with optional price
- **CafeTable** — tables with unique QR tokens
- **Order** — orders with type, status, payment status
- **OrderItem** — line items with snapshotted name/price/options

All prices stored in **cents** (integers). Every table scoped by `cafeId` for tenant isolation.

### Seed Data

```bash
pnpm db:seed
```

Seeds: 1 platform admin, 1 demo cafe, 1 demo owner, 5 categories, 7 menu items with options, and 10 tables.

## Testing

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests (Playwright)
pnpm test:e2e

# Full check
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

### Critical E2E Flow
1. Customer opens QR URL
2. Selects Large Latte with Oat milk and Extra shot
3. Adds to cart
4. Submits pay-at-counter order
5. Sees order success page
6. Staff dashboard shows new order
7. Staff marks order → Preparing → Ready → Completed

## Build

```bash
pnpm build
```

## Deployment

### Recommended Stack
- Cloudflare DNS
- VPS (Ubuntu)
- Docker + Docker Compose
- PostgreSQL container
- Next.js app container
- Caddy or Nginx reverse proxy
- GitHub Actions CI for automated deployment

### Steps
1. Buy domain and point to Cloudflare
2. Provision VPS and install Docker
3. Clone repo and create production `.env`
4. Run database migration
5. Build and start with Docker Compose
6. Enable HTTPS via Caddy/Nginx
7. Test public flow, admin login, QR scan, and Stripe webhook

## Performance Targets

| Metric | Target |
|--------|--------|
| Public menu page load | < 2s |
| Order submission | < 3s |
| Admin order refresh (polling) | < 5s |
| QR scan to menu open | < 3s |

## Mobile UX

- Mobile-first customer pages
- Big buttons, sticky cart, clear photos
- Guest ordering (no account required)
- Checkout in under 1 minute
- Staff dashboard works on iPad, Android tablet, laptop, and phone

## Git Workflow

```bash
main ← dev ← feature/...
```

- No direct commits to `main`
- Feature branches merge into `dev`, then `dev` into `main`
- Commit format: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`

### Pre-commit Checklist
- [ ] App starts without crash
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] QR URL opens correct cafe
- [ ] Customer can place order
- [ ] Staff dashboard receives order
- [ ] Migration runs cleanly
- [ ] No secrets committed
- [ ] README/docs updated if needed

## CI/CD

GitHub Actions runs on push to `dev`/`main` and pull requests:
- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm prisma generate`
- `pnpm test`
- `pnpm build`

Do not merge if CI fails or the critical E2E order flow fails.

## MVP Acceptance Criteria

- [ ] SaaS landing page exists
- [ ] Demo cafe page loads with seeded menu
- [ ] QR code opens order page with correct table
- [ ] Menu displays categories, items, and customisation options
- [ ] Customer can add customised item to cart
- [ ] Customer can place pay-at-counter order
- [ ] Customer receives order confirmation
- [ ] Staff dashboard receives order in real-time
- [ ] Staff can update order status (New → Ready)
- [ ] Admin can manage menu, tables, and generate QR codes
- [ ] Database migration and seed work
- [ ] Lint, typecheck, tests, and build pass
- [ ] Production QR scan works on a real phone

Score must be **9/10 or higher** to be considered done.

## Build Timeline

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Foundation | Repo, Next.js, Prisma schema, seed data, public cafe page |
| 2 | Customer Ordering | Order page, item modal, cart, checkout, order API, success page |
| 3 | Admin Dashboard | Login, live orders, status updates, menu/table management, QR generation |
| 4 | Testing & Deployment | Unit/integration/E2E tests, CI, Docker, VPS deployment |
| 5 | Online Payment | Stripe Checkout, webhooks, payment status flow |
| 6 | SaaS Billing | Platform admin, subscriptions, plan limits, cafe suspension |

## License

Proprietary — built for the Coffee Shop QR Ordering SaaS Platform.
