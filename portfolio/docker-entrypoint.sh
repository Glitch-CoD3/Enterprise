#!/bin/sh
set -eu

printf 'window.__PORTFOLIO_CONFIG__ = {"supabaseUrl":"%s","supabasePublishableKey":"%s"};\n' \
  "${VITE_SUPABASE_URL:-}" \
  "${VITE_SUPABASE_PUBLISHABLE_KEY:-}" \
  > /usr/share/nginx/html/portfolio/config.js

exec nginx -g 'daemon off;'
