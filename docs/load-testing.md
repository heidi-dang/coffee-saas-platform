# Load Testing

## Tool

We use [k6](https://k6.io) (v2.1.0) for load testing.

## Test Scripts

| Script | Purpose | Concurrent Users | Duration |
|---|---|---|---|
| `customer-order-flow.js` | Menu browsing | 50 ramp-up | ~2 min |
| `checkout-spike.js` | Simultaneous checkout | 20 → 50 → 100 | ~1.5 min |
| `admin-orders-polling.js` | Admin polling | 5 → 10 | ~4.5 min |

## Prerequisites

- k6 v2.1.0+ installed (`k6 version`)
- Test server running on port 3100 (`localhost:3100`)
- Seed data deployed (demo-coffee cafe, menu items, options)

## Running Tests

All scripts target the **test deployment** at `http://localhost:3100`.

```bash
# Menu browsing test (50 users, 2 min)
k6 run tests/load/customer-order-flow.js

# Checkout spike test (20/50/100 simultaneous, ~1.5 min)
k6 run tests/load/checkout-spike.js

# Admin polling test (5 then 10 users, 5s interval, ~4.5 min)
k6 run tests/load/admin-orders-polling.js

# All tests (sequential)
k6 run tests/load/customer-order-flow.js && \
k6 run tests/load/checkout-spike.js && \
k6 run tests/load/admin-orders-polling.js
```

## PM2 Process Manager

For production, use PM2 with the provided ecosystem config:

```bash
# Start
pm2 start ecosystem.config.js

# Stop
pm2 stop coffee-saas

# Restart
pm2 restart coffee-saas

# Logs
pm2 logs coffee-saas

# Monitor
pm2 monit

# Save process list (survives reboot)
pm2 save
pm2 startup
```

### Memory Limit

- PM2 configured with `max_memory_restart: "1G"`
- The app uses ~150-300 MB under normal load
- During 100 concurrent checkout spike: ~400 MB peak

## Database Connection Behaviour

```bash
# App CPU/memory
top -p $(pgrep -f 'next start')

# Database connections
watch -n 2 'sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname IS NOT NULL;"'

# Slow queries
sudo -u postgres psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Load Test Results

| Metric | Minimum | Tested | Result |
|---|---|---|---|
| Concurrent menu users | 50 | 50 | ✅ p95=57ms, 0% errors |
| Concurrent order submissions | 20 | 100 | ✅ p95=2.26s, 0% errors |
| Admin polling screens | 5 | 10 | ✅ p95=207ms, 0% errors |
| Duplicate order numbers | 0 | 231 orders | ✅ 0 duplicates |
| Lost orders | 0 | 170 spike | ✅ 0 lost |
| Valid checkout failures | 0 | 20/50/100 | ✅ 0 failures |
| Server stability | 10 min | ~10 min total | ✅ stable, no crash |
| Server stability | 30 min | — | stretch — not tested |

### Bottleneck: Order Number Serialization

**Found:** Under 20+ simultaneous POST /api/orders, Prisma transactions all read the same `MAX(orderNumber)`, then race on the unique constraint — causing P2002 errors and 500 Internal Server Error responses for most requests after the first one succeeds.

**Fix:** `pg_advisory_xact_lock(hashtext(cafeId))` inside the transaction serializes order number generation per cafe. The lock is automatically released on transaction commit/rollback. This eliminated all P2002 errors and 500 responses at 100 simultaneous orders.

## Architecture Notes

- **Postgres max_connections**: 100 (default)
- **Prisma connection pool**: Default formula = `num_cpus * 2 + 1`. On 2-vCPU VPS: **5 connections**. This is a bottleneck — concurrent transactions serialize at the advisory lock, but the pool itself limits total concurrent Prisma operations across all users.
- **Active connections under load**: 1–3 during spike (most time spent waiting on advisory lock, not holding a DB connection). No connection exhaustion observed.
- **PgBouncer**: Not yet needed. 5-pool connections comfortably handled 100 concurrent orders + 10 admin polls simultaneously. Recommended when deploying 3+ cafe tenants or scaling beyond 100 concurrent checkout users.
- **PM2**: Production process manager with auto-restart.
- **Order concurrency**: `pg_advisory_xact_lock` per cafeId ensures gapless, unique, conflict-free order numbers without retry loops.
