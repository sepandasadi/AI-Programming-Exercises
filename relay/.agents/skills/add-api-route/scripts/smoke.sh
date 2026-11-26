#!/usr/bin/env bash
# Starts the built API on a spare port, sends one request,
# prints the body and status, and stops the server.
# Usage, from relay/ after `pnpm build`:
#   bash .agents/skills/add-api-route/scripts/smoke.sh \
#     <path> [curl args...]
set -euo pipefail
path="${1:?usage: smoke.sh <path> [curl args...]}"
shift
port="${SMOKE_PORT:-3917}"
PORT="$port" node apps/api/dist/server.js >/dev/null 2>&1 &
pid=$!
trap 'kill "$pid" 2>/dev/null || true' EXIT
for _ in $(seq 50); do
  curl -sf "localhost:$port/health" >/dev/null && break
  sleep 0.1
done
curl -sS -w '\nHTTP %{http_code}\n' "$@" "localhost:$port$path"
