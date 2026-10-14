#!/usr/bin/env bash

VITE_PID_FILE="/tmp/portfolio_preview_vite.pid"
TUNNEL_PID_FILE="/tmp/portfolio_preview_tunnel.pid"
TUNNEL_LOG="/tmp/portfolio_preview_tunnel.log"
URL_FILE="/tmp/portfolio_preview_url.txt"

if [ -f "$VITE_PID_FILE" ]; then
    kill "$(cat "$VITE_PID_FILE")" 2>/dev/null || true
    rm -f "$VITE_PID_FILE"
fi

if [ -f "$TUNNEL_PID_FILE" ]; then
    kill "$(cat "$TUNNEL_PID_FILE")" 2>/dev/null || true
    rm -f "$TUNNEL_PID_FILE"
fi

rm -f "$TUNNEL_LOG" "$URL_FILE"
echo "Preview server and tunnel stopped."
