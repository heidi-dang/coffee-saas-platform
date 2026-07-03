#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

ENV_FILE="${ENV_FILE:-.env.test}"
SEED_DB=false

# Parse flags
for arg in "$@"; do
  case "$arg" in
    --seed)
      SEED_DB=true
      ;;
    *)
      echo "Usage: $0 [--seed]"
      exit 1
      ;;
  esac
done

# ── Load env ────────────────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: Environment file '$ENV_FILE' not found."
  echo "Copy .env.test.example to $ENV_FILE and fill in the values."
  exit 1
fi

echo "==> Loading environment from $ENV_FILE"
set -a
source "$ENV_FILE"
set +a

# ── Validate required variables ─────────────────────────────────────
if [ -z "${JWT_SECRET:-}" ] || [ "${#JWT_SECRET}" -lt 32 ]; then
  echo "ERROR: JWT_SECRET is required and must be at least 32 characters."
  exit 1
fi

if [ -z "${TEST_APP_PORT:-}" ]; then
  echo "ERROR: TEST_APP_PORT is not set."
  exit 1
fi

if [ "$TEST_APP_PORT" = "80" ] || [ "$TEST_APP_PORT" = "443" ]; then
  echo "ERROR: TEST_APP_PORT must NOT be 80 or 443."
  exit 1
fi

# ── Pull latest ─────────────────────────────────────────────────────
echo "==> Pulling latest origin/dev..."
git fetch origin
git checkout dev
git pull origin dev

# ── Install dependencies ────────────────────────────────────────────
echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

# ── Run checks ──────────────────────────────────────────────────────
echo "==> Running tests..."
pnpm test

echo "==> Running linter..."
pnpm lint

echo "==> Running typecheck..."
pnpm typecheck

echo "==> Generating Prisma client..."
pnpm db:generate

echo "==> Building application..."
pnpm build

# ── Database ────────────────────────────────────────────────────────
echo "==> Running database migration..."
pnpm db:deploy 2>&1 | tail -5

if [ "$SEED_DB" = true ]; then
  echo "==> Seeding test database..."
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL is required for seeding."
    exit 1
  fi
  pnpm db:seed 2>&1 | tail -5
  echo "Test database seeded."
fi

# ── Restart test server ─────────────────────────────────────────────
echo "==> Restarting test server..."
"$SCRIPT_DIR/stop-test-server.sh" || true
sleep 1
"$SCRIPT_DIR/start-test-server.sh"

# ── Health check ────────────────────────────────────────────────────
echo "==> Running health check..."
sleep 3
"$SCRIPT_DIR/check-test-server.sh" || {
  echo "WARNING: Health check reported failures. Check logs/test-server.log for details."
  exit 1
}

echo ""
echo "Deploy complete."
echo "URL: ${NEXT_PUBLIC_APP_URL:-http://localhost:$TEST_APP_PORT}"
