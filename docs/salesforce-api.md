# Salesforce API — How It Is Served

**Implementation status:** the public campaign API, donation recorder and signed webhook are implemented. Stripe test PaymentIntent creation is reviewed separately in PR #103. Genuine sandbox events and browser-card submissions verified successful, declined, credited and anonymous payments plus individual/company invoice requests. Event replays did not duplicate records; teaching-sandbox compatibility guards prevent missing legacy funds from blocking recording. Campaign progress reached 400 MXN. Receipt/invoice email delivery remains separate work.

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
| External Credential Principal Access | The Stripe principal (section 6), from E2 on. Supported since Summer '23 for a **named principal**; see section 6. |
| User External Credentials object | Read and Create (the only levels allowed for guests). Not granted by default on guest profiles; set it by hand. |

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
- **Confirmed (2026-11-06, #39):** the allowlist applies to Apex REST served through a Salesforce Site to the unauthenticated Guest User, including the `OPTIONS` preflight for `POST` with `Content-Type: application/json`. Results are below the test commands.
- **Test:** run these again whenever the site moves to another org or the origin changes.
  ```bash
  # Preflight, as the browser sends it before a JSON POST
  curl -si -X OPTIONS "$SF_SITE_URL/services/apexrest/donations/v1/health" \
    -H "Origin: https://<our-domain>" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type"
  # Actual request
  curl -si "$SF_SITE_URL/services/apexrest/donations/v1/health" -H "Origin: https://<our-domain>"
  # Same request from an origin that is not allowed
  curl -si "$SF_SITE_URL/services/apexrest/donations/v1/health" -H "Origin: https://evil.example"
  ```
  Pass: the preflight answers 2xx with `Access-Control-Allow-Origin: https://<our-domain>` and allows `POST` and `content-type`; the real request carries the same header; the other origin gets no allow header (or a `403`). Then confirm once from the deployed web app in a browser, since curl does not enforce CORS.
- **Result (2026-11-06):** run on the class sandbox `class2026h`, site at the domain root (`SF_SITE_URL` = `https://uady--class2026h.sandbox.my.salesforce-sites.com`), origin `https://dietpi.tail6cb6c6.ts.net:8443` in the allowlist, guest profile with Apex class access to `HealthResource` only.

  | Request | Status | CORS headers |
  | :--- | :--- | :--- |
  | Preflight from our origin | `200` | `Access-Control-Allow-Origin: https://dietpi.tail6cb6c6.ts.net:8443`, `Access-Control-Allow-Methods: HEAD, GET, POST, PUT, PATCH, DELETE`, `Access-Control-Allow-Headers: X-SFDC-Request-Id,content-type`, `Access-Control-Allow-Credentials: false` |
  | `GET` and `POST` from our origin | `200 {"status":"ok"}` | Same allow-origin header |
  | `GET` and preflight from `https://evil.example` | `200` | None, so the browser blocks the read |

  From the deployed web app in Chrome (`API_MODE=salesforce`), `fetch` `GET` and a JSON `POST` both returned `{"status":"ok"}` with no CORS error. **Pass.** The allowed methods are the org's default for every allowed origin; only the methods our classes define answer. The web app's CSP must list the site origin in `connect-src`, which the Docker image does when `API_MODE=salesforce`.

The webhook needs no CORS: Stripe calls it server to server.

## 5. Stripe webhook endpoint

- **Raw body:** read `RestContext.request.requestBody` as the exact bytes Stripe sent. The signature is computed over that string, so never re-serialize the JSON before checking it.
- **Signature (`RF-V3b`):** `StripeSignatureVerifier` checks HMAC-SHA256 of `<t>.<raw body>` with `Crypto.verifyHMac`, accepts any matching `v1`, ignores unknown signature versions and rejects timestamps more than 300 seconds in either direction. Header names are matched without case sensitivity. Keep the exact UTF-8 body, including whitespace and accents.
- **Signing secret:** `Stripe_Settings__c.Webhook_Secret__c` is a hierarchy custom setting with Protected definition visibility, filled in by hand at the organization level. Only the definition and blank field schema are versioned. Protected visibility does not create managed-package isolation in this unpackaged project; existing Apex and trusted administrators remain inside the boundary. The guest receives no setting permissions or settings-read API. Never put the value in code, custom metadata, screenshots, terminal commands or a static resource (`M3`).
- **Order of work:** verify the signature, check `Stripe_Event__c` for the event ID (duplicate → answer `200` and stop), then record. Unknown event types are logged and answered `200`.
- **Responses:** `200` when handled or already handled. `400` for a bad signature or an unreadable body, with the reason logged in `Stripe_Event__c` for `RF-S4`. `500` when recording fails, so Stripe retries; the unique PaymentIntent ID makes the retry safe.
- **Register it** in the Stripe test dashboard at `{SF_SITE_URL}/services/apexrest/donations/v1/webhooks/stripe`, for `payment_intent.succeeded` and `payment_intent.payment_failed`. **Check** that Stripe reaches it (#46).

### Activation and verification (#46, RF-V3a, RF-V3b)

1. Deploy [stripe-webhook.xml](../manifest/stripe-webhook.xml). It contains the verifier, scoped event writer, REST resource, isolated tests, setting schema and guest class access; it grants no business-object CRUD and does not redeploy the payment-session provider.
2. In the same Stripe sandbox as the test API key, open Workbench > Webhooks > Add destination. Select **snapshot events** for this account (the complete `data.object` is required), subscribe to `payment_intent.succeeded` and `payment_intent.payment_failed`, and choose a webhook endpoint. Use `https://uady--class2026h.sandbox.my.salesforce-sites.com/services/apexrest/donations/v1/webhooks/stripe` for the class sandbox. Save the destination.
3. Reveal the destination's signing secret in Stripe and enter it directly in Salesforce Setup > Custom Settings > Stripe Settings > Manage > New (organization-level default) > Webhook Signing Secret. Save. Do not copy it into chat, Git, logs or shell commands. This is a different credential from the API secret key used by the Named Credential.
4. Before configuration, the public endpoint fails closed with sanitized `503 INTERNAL_ERROR`. After configuration, an unsigned request must return `400 VALIDATION_FAILED`, create only a rejection log and leave donation counts unchanged. This does not prove that Stripe itself can reach the endpoint.
5. Complete a genuine test-mode PaymentIntent created by the portal API with its contract metadata, using the team's test card flow. In Stripe's destination **Event deliveries**, verify HTTP 200; in Salesforce, verify one Closed Won donation with the same payment ID, the correct amount/recognition/invoice choices and a Processed event log. Reload the campaign and check the progress; anonymous names and invoice data must stay private. A generic generated Stripe event without the portal metadata is not a valid donation fixture.
6. Resend that event from Stripe. The response must stay 200 while the opportunity, invoice and campaign total stay unchanged. A different successful event ID for the same payment is logged as Duplicate. Failed/cancelled and unsupported notices are logged without creating donations.

Rejected requests use random server-generated diagnostic IDs, fixed reason codes and arrival times. An unsigned request cannot reserve a real event ID or erase a previously processed one. The full body, signature, donor data and provider exception are never persisted. Recording failures return 500 and preserve retryability; the recorder rolls back partial donation writes before the rejection log is written. Failed and unsupported signed events use Processed plus a reason code, with no linked donation. See the provider-only response contract in [contract.md](contract.md#6-stripe-webhook-provider-only).

**Observed sandbox checks (2026-11-17):** the user authorized the official Stripe CLI for the existing sandbox. A genuine 50 MXN failed-payment fixture produced `evt_3UcqG6EKKiG1NXGf0BSfgu1b`, which Salesforce logged as Processed / PAYMENT_FAILED with no linked donation; resending it kept one event-log record. A separate portal session, `pi_3UcqHUEKKiG1NXGf1HVZzhEA`, was confirmed successfully with a Stripe test payment method and emitted `evt_3UcqHUEKKiG1NXGf15ftf5OY`. Initially, the recorder transaction failed in the pre-existing `OpportunityTrigger`, which queried nonexistent `FONDOS SDU`: RECORDING_FAILED was logged without retaining a Contact, Opportunity or campaign progress. An administrator-only diagnostic repeated the recorder under an outer rollback and exposed the dependency without retrieving the webhook secret. After explicit org-admin authorization, the trigger was retrieved and updated to query a list, skip its optional rollup when absent, and retain its existing insert/update/delete calculations when present. Its API version is 67 with explicit system-mode query/DML, preserving the original trigger context without granting guest CRUD. Twenty-eight Apex methods passed, including four new legacy regressions with 200-record batches, and PMD Security/Performance found zero violations. Replaying the original successful event then created one anonymous 50 MXN Closed Won Website donation and one Processed event log. The campaign API showed 50/1,000 MXN (5%), zero public supporters and no private donor fields. Another replay left one donation, one processed event log and the same campaign total; no invoice was created because none was requested.

**Teaching-sandbox compatibility deployment:** `OpportunityTrigger` and `LegacyOpportunityTriggerTest` are versioned for review of the authorized shared-org fix, separately from the portable [webhook manifest](../manifest/stripe-webhook.xml). They depend on pre-existing legacy net-amount/fund fields and should only be deployed to an org containing that legacy automation. No real `FONDOS SDU` campaign was created. Its original aggregation behavior when present remains security risk R9; this guard resolves the missing-record failure only.

The browser donor checks on 2026-11-17 exposed a second shared-org dependency: NPSP updates an existing CampaignMember when linking a returning donor, which invokes `PreApproveStudent` and its `CampaignMemberTriggerHandler`. The handler previously queried the absent fund even when scholarship approval had not changed. The transaction rolled back both the donation and invoice request, while Stripe retained the successful test payment for webhook retry. The compatibility handler now returns before querying for unrelated updates and skips the optional fund when absent, preserving approval/reversal amounts when present. Its source and `LegacyCampaignMemberTriggerTest` are separate from the portable webhook manifest and depend on the legacy scholarship fields and trigger. Four new isolated regressions cover 200 unrelated updates, missing-fund approval, bulk approval/reversal with an existing fund, and a returning donor's invoice donation plus replay. All 32 selected Apex methods passed; PMD Security/Performance found zero violations after explicitly preserving the handler's legacy system context. No extra guest object access, fund record, or automation deactivation was required.

Recovery reused the two already-paid Stripe sandbox events, rather than confirming new payments. Each produced one Closed Won 50 MXN donation, one Processed notice and one Requested / Simulation / Individual invoice request. Both payments selected credited recognition, so the deployed wall correctly added two name/amount entries; this does not prove anonymous invoice privacy in a real browser submission. The public response still contains only `displayName` and `amount` for supporters. The campaign reached 300/1,000 MXN, with 700 MXN remaining, in both the API and deployed browser. Resending the second event again left five Website donations totaling 300 MXN and two invoice requests; both Stripe events reported zero pending webhooks. The final sharing declaration was deployed successfully with four member regressions passing after the broader 32-method run. Emails remain separate unfinished work.

Follow-up browser checks completed the individual/company invoice variants: one anonymous individual donation for 50 MXN retained no public name and added a Requested / Simulation / Individual invoice request, while one credited company donation for 50 MXN linked the Opportunity to a business Account and added a Requested / Simulation / Company invoice request. Both signed events were Processed. The campaign API reached 400 MXN with four credited supporters; anonymous donor and fiscal data were absent from that public response. The user also confirmed required-field, minimum-amount, RFC and postal-code form errors. These checks prove recording and public-data filtering, not email delivery; #26, #30 and #47 are assigned to `hjanssena`.

The deployed team website was also inspected after the initial successful replay: both its open-campaign list and the `Ejemplo 1` detail displayed 50/1,000 MXN and 950 MXN remaining. The public recognition wall remained empty for that anonymous donation. Stripe reported zero pending webhooks for the replayed successful event; Salesforce retained one donor contact role and zero invoice requests for this payment. The later browser submissions described above then verified card confirmation and the subsequent progress updates.

Verification references: [Stripe snapshot setup and signature verification](https://docs.stripe.com/events/set-up-events), [Salesforce Crypto reference](https://developer.salesforce.com/docs/platform/apex-ref/references/apex-ref/apex-classes-restful-crypto.html). Deployment corrected an unavailable `Crypto.areEqualConstantTime` call to the supported HMAC verification API; an initial test also incorrectly treated custom-setting describe access as business-object CRUD. Isolation is checked on Opportunity permissions and on the public response instead.

## 6. Stripe callout (E2)

- **External Credential** `Stripe` (custom authentication) with one principal holding the test secret key as a parameter, entered in the org by hand. **Named Credential** `Stripe_API` with URL `https://api.stripe.com` and an `Authorization: Bearer` header built from that parameter. Apex calls `callout:Stripe_API/v1/payment_intents`; the key never appears in code.
- Stripe expects form-encoded bodies: `amount`, `currency=mxn`, `payment_method_types[]=card`, `description`, and `metadata[<key>]=<value>` for every key in contract section 4.
- Send an `Idempotency-Key` header per payment session request, so a retried request does not create two PaymentIntents.
- The callout runs as the Guest User. Since Summer '23, a guest profile can make Named Credential callouts when the External Credential uses a **named principal** (one shared credential, which is our case). The guest profile needs:
  - **External Credential Principal Access** to the `Stripe` principal;
  - **User External Credentials** object access, Read and Create, set by hand.
- **Check:** some community reports say the User External Credentials permission could not be edited on certain guest-license profiles. Confirm on our org in E1 by saving those two settings on the site's guest profile; no Stripe call is needed. If it cannot be saved, the fallback is a custom setting holding the key in a field only Apex reads, with the callout to `https://api.stripe.com` allowed in Remote Site Settings. That is weaker than a Named Credential, so record it in `docs/seguridad.md` if used.
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
