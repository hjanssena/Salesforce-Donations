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

The site runs on the team's Raspberry Pi (`dietpi`) and is published to the internet with **Tailscale Funnel** at **https://dietpi.tail6cb6c6.ts.net:8443/**. Funnel handles the TLS certificate and the public address, so there is no port forwarding, no DNS record and no certbot. Port 8443 is used because the Pi's nginx already serves private sites on 443 of its Tailscale IP.

Every push to `main` that changes something under `web/` runs `.github/workflows/web-deploy.yml`, which you can also start by hand from the Actions tab:

1. Runs lint, typecheck and tests.
2. Builds the Docker image in Actions for ARM (`DEPLOY_PLATFORM=linux/arm64`).
3. Joins the tailnet as a temporary `tag:ci` node, copies the image and `docker-compose.yml` to the Pi over SSH, loads the image with `docker load` and restarts it with `docker compose up -d`. The container listens only on `127.0.0.1:8090`.
4. Checks that the public URL answers.

### One-time setup

1. **Tailscale policy** (admin console → Access controls). Add these entries:
   - `tagOwners` for `tag:ci`;
   - a `hosts` entry for `dietpi`;
   - a grant from `tag:ci` to `dietpi` on `tcp:22` only (the allow-all grant is limited to `autogroup:member`);
   - a `nodeAttrs` entry giving `autogroup:member` the `funnel` attribute.
2. **Tailscale OAuth client** (Settings → Trust credentials): scope **Auth Keys → Write**, tag `tag:ci`.
3. **On the Pi**, once:
   ```bash
   mkdir -p ~/mexico-dreamin-web && cd ~/mexico-dreamin-web
   cat > .env <<'EOF'
   SF_SITE_URL=https://example.my.salesforce-sites.com/donations
   STRIPE_PUBLISHABLE_KEY=pk_test_replace_me
   EOF
   # Publish localhost:8090 on the internet; persists across reboots
   sudo tailscale funnel --bg --https=8443 http://127.0.0.1:8090
   ```
   Add the deploy public key to the deploy user's `~/.ssh/authorized_keys`. The user must be in the `docker` group.
4. **GitHub** → Settings → Environments → **production**, secrets:

   | Secret | Value |
   | :--- | :--- |
   | `TS_OAUTH_CLIENT_ID` | Tailscale OAuth client ID |
   | `TS_OAUTH_SECRET` | Tailscale OAuth client secret |
   | `DEPLOY_HOST` | `100.94.132.10` (the Pi's Tailscale IP) |
   | `DEPLOY_USER` | The deploy user on the Pi |
   | `DEPLOY_SSH_KEY` | Contents of the private deploy key |
   | `DEPLOY_KNOWN_HOSTS` | Output of `ssh-keyscan 100.94.132.10`, run from a machine on the tailnet |

   Repository variables: `DEPLOY_PLATFORM=linux/arm64`. Optional: `DEPLOY_PATH` (default `~/mexico-dreamin-web`) and `SITE_URL`.
5. Run the workflow once (Actions → Web deploy → Run workflow).

To change `SF_SITE_URL` or the Stripe key, edit `.env` on the Pi and run `docker compose up -d` there. No new deploy is needed. To take the site offline: `sudo tailscale funnel --https=8443 off`.

How it fits together:
- `docker/40-app-config.sh` runs before Nginx. It validates the two values and writes `/config.js`. On the Pi the container serves plain HTTP on localhost, and Funnel adds TLS in front. The image can also terminate TLS itself if a Let's Encrypt certificate is mounted at `/etc/letsencrypt/live/$DOMAIN/`, but the deploy does not use that.
- Security headers (CSP allowing only Stripe and the Salesforce site origin, HSTS, `nosniff`, `frame-ancestors 'none'`) are in `docker/templates/security-headers.conf.template`.

If CORS on the Salesforce site does not work (see [docs/salesforce-api.md](../docs/salesforce-api.md), section 4), the fallback is an `/api/` proxy location in this Nginx config. It is not set up yet.
