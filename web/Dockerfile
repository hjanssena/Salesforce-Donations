# syntax=docker/dockerfile:1

# --- Build the static site ---
# The output is plain HTML, JS and CSS, the same on every platform, so this
# stage runs natively on the build machine. Under QEMU (arm64 on an amd64
# runner) `npm ci` can crash with "Illegal instruction".
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Serve it with Nginx ---
FROM nginx:1.27-alpine
# Runtime config and TLS selection run before Nginx starts.
COPY docker/40-app-config.sh docker/45-reload-certs.sh /docker-entrypoint.d/
COPY docker/templates/ /etc/nginx/app-templates/
COPY --from=build /app/dist /usr/share/nginx/html
RUN chmod +x /docker-entrypoint.d/40-app-config.sh /docker-entrypoint.d/45-reload-certs.sh \
 && rm -f /etc/nginx/conf.d/default.conf \
 && mkdir -p /var/www/certbot
EXPOSE 80 443
