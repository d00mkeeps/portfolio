#!/usr/bin/env bash
set -e

PORT=4173
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VITE_PID_FILE="/tmp/portfolio_preview_vite.pid"
TUNNEL_PID_FILE="/tmp/portfolio_preview_tunnel.pid"
TUNNEL_LOG="/tmp/portfolio_preview_tunnel.log"
URL_FILE="/tmp/portfolio_preview_url.txt"

# Kill existing if running
if [ -f "$VITE_PID_FILE" ] && kill -0 "$(cat "$VITE_PID_FILE")" 2>/dev/null; then
    kill "$(cat "$VITE_PID_FILE")" 2>/dev/null || true
    rm -f "$VITE_PID_FILE"
fi

if [ -f "$TUNNEL_PID_FILE" ] && kill -0 "$(cat "$TUNNEL_PID_FILE")" 2>/dev/null; then
    kill "$(cat "$TUNNEL_PID_FILE")" 2>/dev/null || true
    rm -f "$TUNNEL_PID_FILE"
fi

rm -f "$TUNNEL_LOG" "$URL_FILE"

echo "Building latest portfolio bundle..."
cd "$DIR"
npm run build > /dev/null 2>&1

echo "Starting Vite preview server on port $PORT..."
nohup npx vite preview --port "$PORT" --host 0.0.0.0 > /dev/null 2>&1 &
echo $! > "$VITE_PID_FILE"

# Wait for preview server to be responsive
for i in {1..20}; do
    if curl -s "http://127.0.0.1:$PORT" > /dev/null 2>&1; then
        break
    fi
    sleep 0.2
done

echo "Starting ephemeral Cloudflare Quick Tunnel..."
nohup cloudflared tunnel --url "http://127.0.0.1:$PORT" > "$TUNNEL_LOG" 2>&1 &
echo $! > "$TUNNEL_PID_FILE"

# Extract quick tunnel URL
URL=""
for i in {1..30}; do
    URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$TUNNEL_LOG" | head -n 1 || true)
    if [ -n "$URL" ]; then
        break
    fi
    sleep 0.5
done

if [ -z "$URL" ]; then
    echo "Error: Failed to obtain Cloudflare tunnel URL"
    exit 1
fi

echo "$URL" > "$URL_FILE"
echo "PREVIEW_URL: $URL"
