#!/bin/sh
# Writes /config.js from the environment and picks the Nginx site config.
# Runs from the official image's /docker-entrypoint.d before Nginx starts.
set -eu

: "${SF_SITE_URL:?SF_SITE_URL is required}"
: "${STRIPE_PUBLISHABLE_KEY:?STRIPE_PUBLISHABLE_KEY is required}"
SF_SITE_URL="${SF_SITE_URL%/}"

# M1/M3: test publishable keys only. Refuse live or secret keys outright.
case "$STRIPE_PUBLISHABLE_KEY" in
  pk_test_*) ;;
  *) echo "STRIPE_PUBLISHABLE_KEY must start with pk_test_" >&2; exit 1 ;;
esac
case "$SF_SITE_URL" in
  https://*|http://localhost*) ;;
  *) echo "SF_SITE_URL must be an https:// URL" >&2; exit 1 ;;
esac

cat > /usr/share/nginx/html/config.js <<JS
window.__APP_CONFIG__ = {
  sfSiteUrl: "${SF_SITE_URL}",
  stripePublishableKey: "${STRIPE_PUBLISHABLE_KEY}"
};
JS

# Origin only (scheme + host), for the Content-Security-Policy connect-src.
SF_SITE_ORIGIN=$(echo "$SF_SITE_URL" | sed -E 's#^(https?://[^/]+).*#\1#')
export SF_SITE_ORIGIN
DOMAIN="${DOMAIN:-localhost}"
export DOMAIN

# With a certificate for $DOMAIN, serve HTTPS and redirect HTTP to it.
# Without one (local run, or before the first certbot run), serve plain HTTP.
if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  template=/etc/nginx/app-templates/https.conf.template
else
  template=/etc/nginx/app-templates/http.conf.template
  echo "No certificate for ${DOMAIN}; serving HTTP only." >&2
fi
envsubst '${DOMAIN} ${SF_SITE_ORIGIN}' < /etc/nginx/app-templates/security-headers.conf.template > /etc/nginx/security-headers.conf
if [ "$template" = /etc/nginx/app-templates/https.conf.template ]; then
  echo 'add_header Strict-Transport-Security "max-age=31536000" always;' >> /etc/nginx/security-headers.conf
fi
envsubst '${DOMAIN}' < "$template" > /etc/nginx/conf.d/site.conf
cp /etc/nginx/app-templates/app-locations.conf /etc/nginx/app-locations.conf
