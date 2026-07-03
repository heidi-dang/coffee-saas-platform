#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

PID_FILE="${PID_FILE:-.tmp/test-server.pid}"

if [ ! -f "$PID_FILE" ]; then
  echo "No PID file found at $PID_FILE"
  echo "The test server may not be running."
  exit 0
fi

PID=$(cat "$PID_FILE")

if [ -z "$PID" ]; then
  echo "PID file is empty."
  rm -f "$PID_FILE"
  exit 0
fi

# Check if the process exists and is a Node process from this project
if kill -0 "$PID" 2>/dev/null; then
  # Verify it's a Next.js/Node process (safety check)
  PROC_CMD=$(ps -p "$PID" -o comm= 2>/dev/null || echo "")
  if echo "$PROC_CMD" | grep -qiE "node|next"; then
    echo "Stopping test server (PID $PID)..."
    kill "$PID" 2>/dev/null || true
    # Wait up to 10 seconds for graceful shutdown
    for i in $(seq 1 10); do
      if ! kill -0 "$PID" 2>/dev/null; then
        break
      fi
      sleep 1
    done
    # Force kill if still running
    if kill -0 "$PID" 2>/dev/null; then
      echo "Force stopping (PID $PID)..."
      kill -9 "$PID" 2>/dev/null || true
    fi
    echo "Test server stopped."
  else
    echo "WARNING: Process $PID is not a Node process (found: $PROC_CMD)."
    echo "Not killing it. Remove $PID_FILE manually if it is stale."
    exit 1
  fi
else
  echo "Process $PID is not running."
fi

rm -f "$PID_FILE"
