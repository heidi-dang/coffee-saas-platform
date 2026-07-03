#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

ENV_FILE="${ENV_FILE:-.env.test}"
PID_FILE="${PID_FILE:-.tmp/test-server.pid}"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass=0
fail=0

check() {
  local desc="$1"
  local result="$2"
  if [ "$result" = "true" ]; then
    echo -e "${GREEN}PASS${NC} $desc"
    pass=$((pass + 1))
  else
    echo -e "${RED}FAIL${NC} $desc"
    fail=$((fail + 1))
  fi
}

# Load env for URL
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

BASE_URL="${NEXT_PUBLIC_APP_URL:-}"
PORT="${TEST_APP_PORT:-3000}"

# ── 1. Process check ────────────────────────────────────────────────
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    check "App process (PID $PID) is running" "true"
  else
    check "App process (PID $PID) is running" "false"
  fi
else
  check "App process (PID file exists)" "false"
fi

# ── 2. Port check ──────────────────────────────────────────────────
if lsof -i ":$PORT" -sTCP:LISTEN -Pn 2>/dev/null | grep -q LISTEN; then
  check "Port $PORT is listening" "true"
else
  check "Port $PORT is listening" "false"
fi

# ── 3-8. HTTP checks ──────────────────────────────────────────────
if [ -z "$BASE_URL" ]; then
  BASE_URL="http://localhost:$PORT"
fi

for endpoint in "/" "/cafe/demo-coffee" "/cafe/demo-coffee/order" "/admin/login"; do
  url="${BASE_URL}${endpoint}"
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
  if [ "$status" != "000" ]; then
    check "$url returns HTTP $status" "true"
  else
    check "$url is reachable" "false"
  fi
done

# ── Summary ────────────────────────────────────────────────────────
echo ""
echo "────────────────────────────"
echo -e "${GREEN}$pass passed${NC}, ${RED}$fail failed${NC}"
echo "────────────────────────────"

if [ "$fail" -gt 0 ]; then
  exit 1
fi
