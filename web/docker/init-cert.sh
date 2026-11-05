#!/bin/sh
# First certificate for $DOMAIN. Run once on the server from web/:
#   sh docker/init-cert.sh
# Needs DOMAIN and CERTBOT_EMAIL in web/.env, and DNS for DOMAIN pointing here.
set -eu
cd "$(dirname "$0")/.."
. ./.env
: "${DOMAIN:?set DOMAIN in .env}"
: "${CERTBOT_EMAIL:?set CERTBOT_EMAIL in .env}"

# 1. Start the site over HTTP (no certificate yet), which also serves the challenge.
docker compose up -d --build web
# 2. Ask Let's Encrypt for the certificate through the shared webroot.
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot -d "$DOMAIN" \
  --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email --non-interactive
# 3. Restart so the container finds the certificate and switches to HTTPS.
docker compose restart web
docker compose up -d certbot
echo "Done: https://$DOMAIN"
