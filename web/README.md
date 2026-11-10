# Web App — Mexico Dreamin Donation Portal

The public donation site, in Spanish. React + TypeScript built with Vite, served by Nginx in Docker on the team's server with a Let's Encrypt certificate. It talks only to the Salesforce API in [docs/contract.md](../docs/contract.md); the architecture is in [docs/architecture.md](../docs/architecture.md).

## Configuration

Three values, none of them secret:

| Variable | What it is |
| :--- | :--- |
| `API_MODE` | `mock` answers from the contract examples inside the browser, with no Salesforce. `salesforce` (the image default) calls the real API. The deploy's compose file defaults to `mock` until the Salesforce site is ready (#39, #44). |
| `SF_SITE_URL` | Public Salesforce Site URL, no trailing slash. The API is under `/services/apexrest/donations/v1`. Required with `API_MODE=salesforce`, ignored with `mock`. |
| `STRIPE_PUBLISHABLE_KEY` | Stripe **test** publishable key (`pk_test_...`). The app and the container refuse anything else (`M1`). |

The Docker image reads them **at container start** and writes `/config.js`, so one image runs on any server. In development they come from `VITE_API_MODE`, `VITE_SF_SITE_URL` and `VITE_STRIPE_PUBLISHABLE_KEY` in `.env.local`. See `src/config/config.ts`.

Never commit `.env`, `.env.local`, a Stripe secret key (`sk_...`) or a webhook secret. The secret key lives only in Salesforce (`M3`).

## API and mock

`src/api/` holds the contract ([docs/contract.md](../docs/contract.md)) in code:

| File | What it is |
| :--- | :--- |
| `types.ts` | Request, response and error shapes. |
| `client.ts` | The three endpoints. Errors become an `ApiError` with the HTTP status, the contract `code` and the `fields`. |
| `validation.ts` | The `POST /payment-sessions` rules. The donation form runs them before sending; the mock answers with them. |
| `mock/` | The mock API: a `fetch` that answers in the browser from the contract examples (`fixtures.ts`). |
| `index.ts` | Picks the real API or the mock from `API_MODE`. |

With the mock, the page shows a "Vista previa" strip so nobody mistakes the sample data for real progress. Every error in the contract can be reproduced:

| To get | Do |
| :--- | :--- |
| Several open campaigns (the list) | Open the site with `?mock=many-open`. |
| No open campaign | Open the site with `?mock=no-open`. |
| `400 VALIDATION_FAILED` | Break any rule, for example an amount under 50 or the public name `spam` (banned word). |
| `404 CAMPAIGN_NOT_FOUND` | Ask for an unknown campaign ID. |
| `409 CAMPAIGN_NOT_OPEN` | Start a payment for the completed campaign `701Hs00000XyZwVUTS`. |
| `502 PAYMENT_PROVIDER_ERROR` | Donor email `provider-error@example.com`. |
| `500 INTERNAL_ERROR` | Donor email `internal-error@example.com`. |

A successful payment session returns a placeholder `clientSecret` (`pi_mock_0001_secret_mock`), like Salesforce does in E1. If the contract changes, change the fixtures and `validation.ts` in the same pull request.

## Pages

`src/router.ts` matches the path; `src/Link.tsx` moves between pages without reloading. Nginx serves `index.html` for every path, so shared links and reloads work.

| Path | Page |
| :--- | :--- |
| `/` | One open campaign opens directly; several show the list; none shows a notice that leads to the completed campaigns (`RF-D1a`, `RF-D1c`). |
| `/campanas` | The open campaigns, always as a list. Campaign pages link back here. |
| `/campanas/finalizadas` | The completed campaigns, with what each raised against its goal (`RF-D1c`). |
| `/campanas/{id}` | One campaign. A completed one is read only: its tally and supporters, no way to donate. An unknown ID shows a "not found" notice. |
| `/gracias` | The thank-you page (`RF-D4`). |

## Donating

The donate board has two steps. The donor picks an amount, then fills in `src/donate/DonationForm.tsx`:
- recognition, with their name on the list or anonymous;
- their email;
- optionally the invoice data;
- the card.

Recognition and invoice are independent (`details.ts` builds the request). The card field is Stripe's Payment Element in deferred intent mode (`PaymentStep.tsx`), so it shows before any PaymentIntent exists. On "Pagar" (`submit.ts`):
1. Stripe checks the card field and `validation.ts` checks the form.
2. `POST /payment-sessions` returns the `clientSecret`.
3. The gateway (`src/payment/gateway.ts`) confirms the payment.

Success goes to `/gracias`, which words its message by the payment status (`src/thanks/`) and never says the donation is recorded.

`API_MODE` also picks the gateway:
- `salesforce` calls `stripe.confirmPayment` with the real `clientSecret`.
- `mock` cannot confirm the placeholder secret. It turns the card into a PaymentMethod in Stripe test mode and fakes the result from the test card number:

| Test card | Result |
| :--- | :--- |
| `4242 4242 4242 4242` | Paid; goes to `/gracias` |
| `4000 0000 0000 0002` (also `…9995`, `…9987`, `…0069`, `…0127`, `…0119`) | Declined; stays on the form |
| `4000 0025 0000 3155` (also `…3184`, `…3220`) | Card verification left unfinished; stays on the form |

Any future date and any CVC work. The card field needs a real Stripe **test** publishable key; with the `pk_test_replace_me` placeholder it shows "No pudimos cargar el campo de la tarjeta". Spanish text for every contract code is in `src/donate/messages.ts`.

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
  -e API_MODE=mock \
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
   API_MODE=mock
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

To switch to the real API, set `API_MODE=salesforce` and `SF_SITE_URL` in `.env` on the Pi and run `docker compose up -d` there. The same goes for the Stripe key. No new deploy is needed. To take the site offline: `sudo tailscale funnel --https=8443 off`.

How it fits together:
- `docker/40-app-config.sh` runs before Nginx. It validates the values and writes `/config.js`. On the Pi the container serves plain HTTP on localhost, and Funnel adds TLS in front. The image can also terminate TLS itself if a Let's Encrypt certificate is mounted at `/etc/letsencrypt/live/$DOMAIN/`, but the deploy does not use that.
- Security headers (CSP allowing only Stripe and the Salesforce site origin, HSTS, `nosniff`, `frame-ancestors 'none'`) are in `docker/templates/security-headers.conf.template`.

The browser calls the Salesforce site directly. Its CORS allowlist must include this site's origin; the check and its result are in [docs/salesforce-api.md](../docs/salesforce-api.md), section 4.
