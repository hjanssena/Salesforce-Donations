# Salesforce API — How It Is Served

How the Salesforce org serves the API in [contract.md](contract.md) and the Stripe webhook: the public site, the Guest User, the Apex REST classes, CORS, the Stripe callout, and the limits to watch. The contract says what the API looks like; this page says how Salesforce provides it. Context: [architecture.md](architecture.md).

Items marked **Check** are not confirmed on our org yet. Confirm them with the hello-world endpoint (#39) before building on them, and update this page with the result.

## 1. Public site

| Choice | Reason |
| :--- | :--- |
| A **Salesforce Site** (Setup → Sites), not an Experience Cloud site | We only need a public URL for Apex REST. The web app is React on our own server, so there are no Salesforce pages to host. A Site is less to configure and less to secure. |
| One site, for example `donations` | Gives the public base URL `https://<my-domain>.my.salesforce-sites.com/<path>`, which is `{SF_SITE_URL}` in the contract. |
| Site home page | A blank Visualforce page. Nobody visits it. |

The API is then served at `{SF_SITE_URL}/services/apexrest/donations/v1/...`.

**Default record owner:** records created in guest context are assigned to the site's default owner. Set it to an internal admin user in the site settings, so donations created by the webhook have a real owner.

## 2. Guest User

Each site has its own Guest User and guest profile (site → Public Access Settings).

| Setting | Value |
| :--- | :--- |
| Object permissions | **None** on every object, including Campaign and Opportunity (`M2`). |
| Enabled Apex Class Access | Only the `@RestResource` classes in section 3. |
| Field permissions, tabs, Visualforce pages | None, apart from the site's blank home page. |
| External Credential Principal Access | The Stripe principal (section 6), from E2 on. **Check** that the guest profile can hold it. |

Because the guest has no object permissions, the Apex that reads campaigns and writes donations has to bypass them on purpose, in a small number of places:

- Reads go through **one selector class declared `without sharing`** that queries only the fields the contract returns. It never selects `Email`, `RFC__c` or any invoice field.
- Writes (the recording service) also run `without sharing`, and only from the webhook after the signature check.
- Mark those queries and DML `WITH SYSTEM_MODE` / `AccessLevel.SYSTEM_MODE` explicitly, with a comment saying why. Code Analyzer flags them (`ApexCRUDViolation`, `ApexSharingViolations`); suppress each finding with that same reason rather than widening guest access.
- Every other class is `with sharing`.

This is what `RF-V2` proves: the guest can call the API, but cannot read or write a record any other way.

## 3. Apex REST classes

The `urlMapping` is relative to `/services/apexrest`. Each resource is thin: it parses the request, calls a service, and turns the result or the error into the contract's JSON.

| Class | `urlMapping` | Method | Contract / story |
| :--- | :--- | :--- | :--- |
| `HealthResource` | `/donations/v1/health` | `GET` → `{"status":"ok"}` | Connection check (#39). Not in the contract; remove or keep after E1. |
| `CampaignsResource` | `/donations/v1/campaigns/*` | `GET` list (`?status=`) and `GET /{id}` | Contract section 2 (`RF-D1a`, `RF-D1c`, `RF-C1`) |
| `PaymentSessionsResource` | `/donations/v1/payment-sessions` | `POST` | Contract section 3 |
| `StripeWebhookResource` | `/donations/v1/webhooks/stripe` | `POST` | `RF-V3a`, `RF-V3b`. Called by Stripe, not by the web app. |

Behind them:

| Class | Job |
| :--- | :--- |
| `PublicCampaignSelector` | The only `without sharing` reader. Open and completed campaigns, supporters (credited, visible, name and amount only). |
| `CampaignService` | Status by dates (America/Merida), sorting, mapping to the contract's JSON. |
| `PaymentSessionValidator` | Every rule in contract section 3, returning the field codes. Shares the RFC and postal code rules with any staff-side validation. |
| `PaymentSessionService` | Validates, builds the metadata (contract section 4), calls `StripeClient`. |
| `StripeClient` (interface) | E1: `PlaceholderStripeClient` returns a fake `clientSecret` and `paymentIntentId`. E2: `HttpStripeClient` calls Stripe through the Named Credential. Swapping one for the other does not touch the contract. |
| `StripeSignatureVerifier` | Checks the `Stripe-Signature` header (section 5). |
| `DonationRecorder` | `RF-D3`: from a `payment_intent.succeeded` event, find or create the Contact (and Account for a company invoice), create the Opportunity and `Invoice_Request__c`, log the `Stripe_Event__c`. Idempotent on the PaymentIntent ID. Bulk-safe, no SOQL or DML in loops. |
| `ApiResponse` / `ApiException` | One place that sets `RestContext.response.statusCode` and writes the error shape. Catches everything at the resource boundary and returns `INTERNAL_ERROR` with no details (`S11`). |

## 4. CORS

The web app calls the API from the browser, so the org must allow its origin.

- Add `https://<our-domain>` to **Setup → CORS → Allowed Origins List**. No wildcards, no `http://` origins. Add `http://localhost:<port>` only while developing, and remove it before each delivery.
- **Check:** that the allowlist applies to Apex REST served through a Salesforce Site, including the `OPTIONS` preflight for `POST` with `Content-Type: application/json`. This is the first thing the hello-world endpoint tests.
- **Fallback if it does not:** the web app's own server (Nginx in the Docker image) proxies `/api/*` to `{SF_SITE_URL}/services/apexrest/donations/v1/*`. The browser then calls our own domain and no cross-origin request happens. The web app only changes its base URL setting; the contract does not change. This stays on the team's server, so it fits the approved hosting exception.

The webhook needs no CORS: Stripe calls it server to server.

## 5. Stripe webhook endpoint

- **Raw body:** read `RestContext.request.requestBody` as the exact bytes Stripe sent. The signature is computed over that string, so never re-serialize the JSON before checking it.
- **Signature (`RF-V3b`):** the `Stripe-Signature` header has `t=<timestamp>` and one or more `v1=<signature>`. Compute HMAC-SHA256 of `<t>.<raw body>` with the signing secret (`Crypto.generateMac('hmacSHA256', ...)`, hex-encoded), compare it with each `v1`, and reject timestamps older than 5 minutes.
- **Signing secret:** a hierarchy custom setting field (for example `Stripe_Settings__c.Webhook_Secret__c`) filled in by hand in the org. Custom setting values are data, not metadata, so they never reach the repository. Never put the secret in code, custom metadata, or a static resource (`M3`).
- **Order of work:** verify the signature, check `Stripe_Event__c` for the event ID (duplicate → answer `200` and stop), then record. Unknown event types are logged and answered `200`.
- **Responses:** `200` when handled or already handled. `400` for a bad signature or an unreadable body, with the reason logged in `Stripe_Event__c` for `RF-S4`. `500` when recording fails, so Stripe retries; the unique PaymentIntent ID makes the retry safe.
- **Register it** in the Stripe test dashboard at `{SF_SITE_URL}/services/apexrest/donations/v1/webhooks/stripe`, for `payment_intent.succeeded` and `payment_intent.payment_failed`. **Check** that Stripe reaches it (#46).

## 6. Stripe callout (E2)

- **External Credential** `Stripe` (custom authentication) with one principal holding the test secret key as a parameter, entered in the org by hand. **Named Credential** `Stripe_API` with URL `https://api.stripe.com` and an `Authorization: Bearer` header built from that parameter. Apex calls `callout:Stripe_API/v1/payment_intents`; the key never appears in code.
- Stripe expects form-encoded bodies: `amount`, `currency=mxn`, `payment_method_types[]=card`, `description`, and `metadata[<key>]=<value>` for every key in contract section 4.
- Send an `Idempotency-Key` header per payment session request, so a retried request does not create two PaymentIntents.
- The callout runs as the Guest User, so the guest profile needs access to the External Credential principal (section 2, **Check**).
- A timeout or a Stripe error becomes `502 PAYMENT_PROVIDER_ERROR`.

## 7. Limits to watch

| Limit | Why it matters | Where to see it |
| :--- | :--- | :--- |
| Site usage (bandwidth and request time per period) | Every web app call goes through the site. | Setup → Sites → the site's usage history |
| Apex governor limits per request | Selector queries and the recording service must stay bulk-safe. | Debug logs, Apex tests |
| Callout timeout | Stripe calls from the payment session endpoint. | Set an explicit timeout on the request |
| Daily single-email limit | Receipt and invoice emails (#47). | **Check** on the Developer Edition org before the demo |

## 8. Testing

- Resource tests set `RestContext.request` and `RestContext.response`, call the method, and assert the status code and JSON against the contract examples.
- Run guest-sensitive tests inside `System.runAs` with the site's guest user, to show the API works without object permissions and that a direct query fails.
- `HttpCalloutMock` for Stripe. A sample `payment_intent.succeeded` event (static resource) whose metadata follows contract section 4 drives `DonationRecorder` in E1.
- Signature tests use a test-only secret and a precomputed header, never the real secret.
- No hard-coded IDs, `SeeAllData=false` (`S14`).

## 9. Setup checklist

1. Create the site; set its default record owner.
2. Guest profile: no object permissions; Apex class access for the resources only.
3. Deploy `HealthResource`; add the web app's origin to CORS; call `/health` from the deployed web app. Record the result in section 4.
4. Deploy the campaign and payment session resources.
5. E2: create the External Credential and Named Credential; grant the guest principal access; switch `StripeClient` to `HttpStripeClient`.
6. E2: fill in the webhook secret custom setting; register the webhook in Stripe; send a test event from the Stripe dashboard.
