#!/usr/bin/env bash
# Rebuild and (re)start the production server on :3100 for screenshotting.
set -e
cd "$(dirname "$0")/.."
PID=$(ps -eo pid,args | awk '/next-server/ && !/awk/ {print $1}' | head -1)
[ -n "$PID" ] && kill -9 "$PID" 2>/dev/null || true
npx next build > /tmp/build.log 2>&1 || { tail -30 /tmp/build.log; exit 1; }
grep -E "First Load JS shared|Route \(app\)" -A6 /tmp/build.log | head -10
( npx next start -p 3100 > /tmp/server.log 2>&1 & )
for i in $(seq 1 25); do sleep 1; [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://localhost:3100)" = "200" ] && { echo "server up"; exit 0; }; done
echo "server did not come up"; tail -20 /tmp/server.log; exit 1
