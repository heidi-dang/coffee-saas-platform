# Test Deployment Guide

> **WARNING**: This server already runs production websites through Caddy. Do not modify existing site blocks. Add only a separate test subdomain block and validate Caddy before reload.

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL (test database, separate from production)
- Caddy (for reverse proxy)
- `lsof` (for port checking)

## Required Environment Variables

See `.env.test.example` for all variables:

| Variable | Description |
|---|---|
| `NODE_ENV` | Must be `production` for test server |
| `APP_ENV` | Must be `test` |
| `NEXT_PUBLIC_APP_URL` | Public URL of the test deployment |
| `TEST_APP_PORT` | Port for the Next.js server (NOT 80 or 443) |
| `DATABASE_URL` | PostgreSQL connection for test DB |
| `JWT_SECRET` | At least 32 characters; required in test/production |

## Setup

```bash
# 1. Copy env file
cp .env.test.example .env.test

# 2. Edit .env.test with your real values
nano .env.test

# 3. Generate a JWT secret
openssl rand -hex 32
# Paste the output into JWT_SECRET in .env.test
```

## Start the Test Server

```bash
./scripts/start-test-server.sh
```

This will:
1. Validate environment variables
2. Check port availability
3. Install dependencies
4. Generate Prisma client
5. Build the app
6. Start on `TEST_APP_PORT`

## Stop the Test Server

```bash
./scripts/stop-test-server.sh
```

This kills only the test server Node process (verified by process name). Never touches Caddy or other services.

## Deploy Latest Changes

```bash
# Deploy without seeding
./scripts/deploy-test-app.sh

# Deploy and seed the test database
./scripts/deploy-test-app.sh --seed
```

This will:
1. Pull latest `origin/dev`
2. Install dependencies
3. Run tests, lint, typecheck
4. Generate Prisma client
5. Build the app
6. Run migrations on test DB
7. Optionally seed test DB
8. Restart the test server
9. Run health check

## Health Check

```bash
./scripts/check-test-server.sh
```

Checks:
- App process is running
- `TEST_APP_PORT` is listening
- Homepage, cafe pages, and admin login are reachable

## Add Caddy Test Subdomain

```bash
# 1. Back up current Caddy config
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d-%H%M%S)

# 2. Edit Caddyfile — add a NEW block; do NOT modify existing blocks
sudo nano /etc/caddy/Caddyfile
```

Add a new site block **after** existing blocks:

```
coffee-test.yourdomain.com {
    reverse_proxy 127.0.0.1:3100
}
```

```bash
# 3. Validate Caddy config
sudo caddy validate --config /etc/caddy/Caddyfile

# 4. Reload Caddy (use reload, not restart, unless required)
sudo systemctl reload caddy

# 5. Test the subdomain
curl -I https://coffee-test.yourdomain.com
```

## Rollback

```bash
# Restore previous Caddy config
sudo cp /etc/caddy/Caddyfile.backup.<date> /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Logs

```bash
# Test server logs
tail -f logs/test-server.log
```

## Files and Directories

| Path | Purpose |
|---|---|
| `.env.test` | Test environment variables (gitignored) |
| `.env.test.example` | Template for test env (committed) |
| `.tmp/test-server.pid` | PID file for the running test server |
| `logs/test-server.log` | Test server stdout/stderr |
| `scripts/start-test-server.sh` | Start the test server |
| `scripts/stop-test-server.sh` | Stop the test server |
| `scripts/deploy-test-app.sh` | Full deploy pipeline |
| `scripts/check-test-server.sh` | Health check |

## Safety Rules

- **Never** modify existing Caddy site blocks
- **Never** start the test app on port 80 or 443
- **Never** point `DATABASE_URL` at the production database
- **Always** validate Caddy config before reloading
- **Always** use `reload` instead of `restart` unless absolutely necessary
