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

The site runs at **https://dreamforce.hjanssen.xyz/**. Every push to `main` that changes something under `web/` runs `.github/workflows/web-deploy.yml`, which you can also start by hand from the Actions tab:

1. Runs lint, typecheck and tests.
2. Builds the Docker image in Actions.
3. Joins your tailnet as a temporary node, then copies the image, `docker-compose.yml` and `docker/init-cert.sh` to the server over SSH through Tailscale, loads the image with `docker load` and restarts it with `docker compose up -d`. The server never builds, and it needs no copy of the repository and no registry login.
4. Checks that the site answers.

### One-time server setup

The server needs Docker with the Compose plugin, Tailscale, the domain's DNS pointing at it, and ports 80 and 443 forwarded to it. SSH (port 22) stays closed to the internet; the deploy reaches it only through the tailnet.

1. Create a deploy user that can run Docker, and a key pair just for GitHub:
   ```bash
   sudo adduser --disabled-password deploy && sudo usermod -aG docker deploy
   ssh-keygen -t ed25519 -N "" -C "github-deploy" -f deploy_key   # on your machine
   # append deploy_key.pub to /home/deploy/.ssh/authorized_keys on the server
   ```
2. Create the deploy directory with its `.env` (never committed):
   ```bash
   mkdir -p ~/mexico-dreamin-web && cd ~/mexico-dreamin-web
   cat > .env <<'EOF'
   DOMAIN=dreamforce.hjanssen.xyz
   CERTBOT_EMAIL=you@example.com
   SF_SITE_URL=https://example.my.salesforce-sites.com/donations
   STRIPE_PUBLISHABLE_KEY=pk_test_replace_me
   EOF
   ```
3. In the Tailscale admin console:
   - In **Access controls**, declare the tag and let it reach only the server's SSH port. Add to the policy file:
     ```jsonc
     "tagOwners": { "tag:ci": ["autogroup:admin"] },
     "grants": [
       { "src": ["tag:ci"], "dst": ["<server's Tailscale name or 100.x IP>"], "ip": ["tcp:22"] }
     ]
     ```
     If your policy still uses `acls` instead of `grants`, the equivalent is `{"action": "accept", "src": ["tag:ci"], "dst": ["<server>:22"]}`.
   - Under **Settings → OAuth clients**, create a client with the **Auth Keys: write** scope and tag `tag:ci`. Copy its ID and secret.
4. In GitHub → Settings → Environments, create **production** and add these secrets:

   | Secret | Value |
   | :--- | :--- |
   | `TS_OAUTH_CLIENT_ID` | Tailscale OAuth client ID |
   | `TS_OAUTH_SECRET` | Tailscale OAuth client secret |
   | `DEPLOY_HOST` | The server's Tailscale IP (`100.x.y.z`) or MagicDNS name |
   | `DEPLOY_PORT` | SSH port (optional, default 22) |
   | `DEPLOY_USER` | `deploy` |
   | `DEPLOY_SSH_KEY` | Contents of the private `deploy_key` |
   | `DEPLOY_KNOWN_HOSTS` | Output of `ssh-keyscan -p <port> <DEPLOY_HOST>`, run from a machine on the tailnet, using exactly the same host as `DEPLOY_HOST` |

   Optional repository variables: `DEPLOY_PATH` (default `~/mexico-dreamin-web`) and `DEPLOY_PLATFORM` (`linux/arm64` for an ARM server; default `linux/amd64`).
5. Run the workflow once (Actions → Web deploy → Run workflow). The site comes up over HTTP, and the job warns that HTTPS is not ready yet.
6. On the server, get the first certificate:
   ```bash
   cd ~/mexico-dreamin-web && sh docker/init-cert.sh
   ```
   From then on the site serves HTTPS, and the `certbot` container renews the certificate.
7. Close SSH to the internet: remove any port 22 forward on your router, or firewall it to the tailnet only (for example `sudo ufw allow in on tailscale0 to any port 22 && sudo ufw deny 22`).

To change `SF_SITE_URL` or the Stripe key, edit `.env` on the server and run `docker compose up -d` there. No new deploy is needed.

How it fits together:
- `docker/40-app-config.sh` runs before Nginx. It validates the two values, writes `/config.js`, and picks the HTTPS site config when `/etc/letsencrypt/live/$DOMAIN/fullchain.pem` exists, or the HTTP one when it does not.
- With HTTPS, port 80 only answers certbot's challenge and redirects everything else.
- The `certbot` container tries to renew twice a day; Nginx reloads every 12 hours to pick up a renewed certificate.
- Security headers (CSP allowing only Stripe and the Salesforce site origin, HSTS, `nosniff`, `frame-ancestors 'none'`) are in `docker/templates/security-headers.conf.template`.

If CORS on the Salesforce site does not work (see [docs/salesforce-api.md](../docs/salesforce-api.md), section 4), the fallback is an `/api/` proxy location in this Nginx config. It is not set up yet.
