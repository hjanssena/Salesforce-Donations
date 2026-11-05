# Web App — Mexico Dreamin Donation Portal

The public donation site, in Spanish. React + TypeScript built with Vite, served by Nginx in Docker on the team's server with a Let's Encrypt certificate. It talks only to the Salesforce API in [docs/contract.md](../docs/contract.md); the architecture is in [docs/architecture.md](../docs/architecture.md).

## Configuration

Two values, neither of them secret:

| Variable | What it is |
| :--- | :--- |
| `SF_SITE_URL` | Public Salesforce Site URL, no trailing slash. The API is under `/services/apexrest/donations/v1`. |
| `STRIPE_PUBLISHABLE_KEY` | Stripe **test** publishable key (`pk_test_...`). The app and the container refuse anything else (`M1`). |

The Docker image reads them **at container start** and writes `/config.js`, so one image runs on any server. In development they come from `VITE_SF_SITE_URL` and `VITE_STRIPE_PUBLISHABLE_KEY` in `.env.local`. See `src/config/config.ts`.

Never commit `.env`, `.env.local`, a Stripe secret key (`sk_...`) or a webhook secret. The secret key lives only in Salesforce (`M3`).

## Development

```bash
cd web
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:5173
```

| Command | Does |
| :--- | :--- |
| `npm run lint` | oxlint |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest + Testing Library |
| `npm run build` | Production build in `dist/` |

The same checks and a Docker build run on every pull request that touches `web/` (`.github/workflows/web-ci.yml`).

## Run the image locally

```bash
docker build -t mexico-dreamin-web .
docker run --rm -p 8080:80 \
  -e SF_SITE_URL=https://example.my.salesforce-sites.com/donations \
  -e STRIPE_PUBLISHABLE_KEY=pk_test_replace_me \
  mexico-dreamin-web
```

Without a certificate the container serves plain HTTP and logs `No certificate for localhost; serving HTTP only.`

## Deploy to the team server

Needs Docker with the Compose plugin, ports 80 and 443 free, and the domain's DNS `A` record pointing at the server.

First time:
```bash
git clone https://github.com/hjanssena/Salesforce-Donations.git
cd Salesforce-Donations/web
cp .env.production.example .env    # fill in DOMAIN, CERTBOT_EMAIL, SF_SITE_URL, STRIPE_PUBLISHABLE_KEY
sh docker/init-cert.sh             # starts over HTTP, gets the certificate, switches to HTTPS
```

Each later release:
```bash
git pull
docker compose up -d --build
```

How it fits together:
- `docker/40-app-config.sh` runs before Nginx. It validates the two values, writes `/config.js`, and picks the HTTPS site config when `/etc/letsencrypt/live/$DOMAIN/fullchain.pem` exists, or the HTTP one when it does not.
- With HTTPS, port 80 only answers certbot's challenge and redirects everything else.
- The `certbot` container tries to renew twice a day; Nginx reloads every 12 hours to pick up a renewed certificate.
- Security headers (CSP allowing only Stripe and the Salesforce site origin, HSTS, `nosniff`, `frame-ancestors 'none'`) are in `docker/templates/security-headers.conf.template`.

If CORS on the Salesforce site does not work (see [docs/salesforce-api.md](../docs/salesforce-api.md), section 4), the fallback is an `/api/` proxy location in this Nginx config. It is not set up yet.
