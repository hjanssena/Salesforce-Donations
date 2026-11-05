#!/bin/sh
# Reloads Nginx every 12 hours so a certificate renewed by certbot is picked up.
set -eu
(
  while sleep 43200; do
    nginx -s reload 2>/dev/null || true
  done
) &
