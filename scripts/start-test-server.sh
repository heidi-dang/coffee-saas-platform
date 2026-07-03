#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# ── Config ──────────────────────────────────────────────────────────
ENV_FILE="${ENV_FILE:-.env.test}"
PID_FILE="${PID_FILE:-.tmp/test-server.pid}"
LOG_FILE="${LOG_FILE:-logs/test-server.log}"

# ── Load env ────────────────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: Environment file '$ENV_FILE' not found."
  echo "Copy .env.test.example to $ENV_FILE and fill in the values."
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

# ── Validation ──────────────────────────────────────────────────────
if [ -z "${JWT_SECRET:-}" ] || [ "${#JWT_SECRET}" -lt 32 ]; then
  echo "ERROR: JWT_SECRET is required and must be at least 32 characters."
  echo "Set it in $ENV_FILE"
  exit 1
fi

if [ -z "${TEST_APP_PORT:-}" ]; then
  echo "ERROR: TEST_APP_PORT is not set."
  echo "Set it in $ENV_FILE"
  exit 1
fi

if [ "$TEST_APP_PORT" = "80" ] || [ "$TEST_APP_PORT" = "443" ]; then
  echo "ERROR: TEST_APP_PORT must NOT be 80 or 443. Those ports are reserved for Caddy."
  exit 1
fi

if lsof -i ":$TEST_APP_PORT" -sTCP:LISTEN -Pn 2>/dev/null | grep -q LISTEN; then
  echo "ERROR: Port $TEST_APP_PORT is already in use."
  echo "Check: lsof -i :$TEST_APP_PORT"
  echo "Stop the existing process or change TEST_APP_PORT in $ENV_FILE"
  exit 1
fi

# ── Directories ─────────────────────────────────────────────────────
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$PID_FILE")"

# ── Dependencies ────────────────────────────────────────────────────
echo "==> Installing dependencies..."
pnpm install --frozen-lockfile 2>&1 | tail -5

echo "==> Generating Prisma client..."
pnpm db:generate 2>&1 | tail -3

# ── Build ───────────────────────────────────────────────────────────
echo "==> Building application..."
NODE_ENV=production pnpm build 2>&1 | tail -10

# ── Start ───────────────────────────────────────────────────────────
echo "==> Starting test server on port $TEST_APP_PORT..."
PORT="$TEST_APP_PORT" NODE_ENV=production APP_ENV=test nohup ./node_modules/.bin/next start --port "$TEST_APP_PORT" >> "$LOG_FILE" 2>&1 &
PID=$!
echo "$PID" > "$PID_FILE"
echo "Started with PID $PID"
echo "Logs: $LOG_FILE"
echo "URL:  ${NEXT_PUBLIC_APP_URL:-http://localhost:$TEST_APP_PORT}"
