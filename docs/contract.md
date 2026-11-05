# Contract — Web App ↔ Salesforce

The agreement between the React web app (front) and the Salesforce org (back). Both sides build against this page and can work apart until they connect. If something here has to change, change this page first, in a pull request both sides review.

The contract has three parts:
1. Two read endpoints for campaigns.
2. One endpoint that starts a payment session.
3. The metadata Salesforce attaches to the Stripe PaymentIntent, which Salesforce reads back when Stripe reports the payment.

The web app talks only to Salesforce. It never calls Stripe's API; it only uses Stripe.js with the `clientSecret` it receives. Context: [architecture.md](architecture.md).

## 1. Conventions

| Topic | Rule |
| :--- | :--- |
| Base URL | `{SF_SITE_URL}/services/apexrest/donations/v1`. The web app reads `{SF_SITE_URL}` from its configuration. |
| Auth | None. Guest User; the org allows only the web app's origin through CORS. |
| Format | JSON, UTF-8. Request header `Content-Type: application/json`. |
| Money | MXN, a JSON number with at most 2 decimals (`250`, `250.50`). Salesforce converts to centavos for Stripe. |
| Dates | Calendar dates `YYYY-MM-DD`, in the America/Merida time zone. A campaign is open from its start date through its end date, both included. |
| IDs | Strings. Treat them as opaque. |
| Language | Field names and codes are English. Text shown to donors (names, descriptions) is Spanish. Error `message` is for developers; the web app maps `code` to its own Spanish text. |
| Version | Breaking changes get a new path (`/v2`). Adding a field is not breaking; the web app must ignore fields it does not know. |

## 2. Campaigns

### `GET /campaigns`
Query: `status` = `open` (default) or `completed`.

Open campaigns are sorted by end date, soonest first. Completed ones by end date, latest first. Campaigns that have not started are never returned.

```json
{
  "campaigns": [
    {
      "id": "701Hs00000AbCdEFGH",
      "name": "Becas Mexico Dreamin 2026",
      "description": "Apoyo para estudiantes de la UADY que asisten al evento.",
      "purpose": "Pagar la inscripción y el transporte de 20 estudiantes.",
      "imageUrl": "https://example.my.site.com/campaigns/becas.jpg",
      "goalAmount": 50000,
      "raisedAmount": 61250.5,
      "startDate": "2026-11-01",
      "endDate": "2026-12-15",
      "status": "open"
    }
  ]
}
```

- `raisedAmount` can be above `goalAmount`; the web app computes the percentage and shows values above 100%.
- `status` is `open` or `completed`.

### `GET /campaigns/{id}`
Same fields as one list item, plus the supporters list:

```json
{
  "id": "701Hs00000AbCdEFGH",
  "name": "Becas Mexico Dreamin 2026",
  "…": "same fields as the list",
  "supporters": [
    { "displayName": "Ana López", "amount": 500 },
    { "displayName": "Empresa Ejemplo", "amount": 2000 }
  ]
}
```

- `supporters` holds only credited donations whose name has not been hidden. Newest first. It never contains an email, an RFC, or anyone who chose to be anonymous.
- Unknown or not-yet-started campaign: `404`, error code `CAMPAIGN_NOT_FOUND`.

## 3. Payment session

### `POST /payment-sessions`
Validates the donor's data and creates a Stripe PaymentIntent. No donation record is created.

Request:
```json
{
  "campaignId": "701Hs00000AbCdEFGH",
  "amount": 250,
  "donorEmail": "ana@example.com",
  "isAnonymous": false,
  "publicName": "Ana López",
  "invoice": {
    "fullName": "Ana María López Pérez",
    "rfc": "LOPA800101ABC",
    "taxpayerType": "individual",
    "postalCode": "97000",
    "taxRegime": "612",
    "cfdiUse": "D04",
    "email": "ana@example.com"
  }
}
```

Response `200`:
```json
{
  "paymentIntentId": "pi_3Abc123",
  "clientSecret": "pi_3Abc123_secret_xyz",
  "amount": 250,
  "currency": "mxn"
}
```

### Request rules
Salesforce is the authority; the web app applies the same rules first so the donor sees errors before sending.

| Field | Required | Rule |
| :--- | :--- | :--- |
| `campaignId` | Always | An open campaign. |
| `amount` | Always | At least `50`, at most 2 decimals, no program maximum. |
| `donorEmail` | Always | Valid email, up to 254 characters. |
| `isAnonymous` | Always | `true` or `false`. |
| `publicName` | If `isAnonymous` is `false` | 1 to 80 characters, no banned word. Must be absent when `isAnonymous` is `true`. |
| `invoice` | Optional | Absent or `null` means no invoice. When present, every field below is required. |
| `invoice.fullName` | With invoice | 1 to 150 characters. |
| `invoice.rfc` | With invoice | Uppercase, `^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$`. Individual: 13 characters. Company: 12. |
| `invoice.taxpayerType` | With invoice | `individual` or `company`. Must match the RFC length. |
| `invoice.postalCode` | With invoice | Exactly 5 digits. |
| `invoice.taxRegime` | With invoice | SAT fiscal regime code from the catalog below. |
| `invoice.cfdiUse` | With invoice | SAT fiscal use code from the catalog below. |
| `invoice.email` | With invoice | Valid email. Where the invoice is sent. |

Starting catalogs (the web app shows Spanish labels; the team confirms the final list):

| `taxRegime` | Label | | `cfdiUse` | Label |
| :--- | :--- | :--- | :--- | :--- |
| `601` | General de Ley Personas Morales | | `D04` | Donativos |
| `603` | Personas Morales con Fines no Lucrativos | | `G03` | Gastos en general |
| `605` | Sueldos y Salarios | | `S01` | Sin efectos fiscales |
| `612` | Personas Físicas con Actividades Empresariales | | | |
| `621` | Incorporación Fiscal | | | |
| `626` | Régimen Simplificado de Confianza | | | |

### Errors
Every error has the same shape. Salesforce never returns stack traces or internal messages.

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "fields": [
      { "field": "amount", "code": "AMOUNT_BELOW_MINIMUM" },
      { "field": "publicName", "code": "BANNED_WORD" }
    ]
  }
}
```

| HTTP | `error.code` | When |
| :--- | :--- | :--- |
| 400 | `VALIDATION_FAILED` | Any field breaks a rule. `fields` lists each one. |
| 404 | `CAMPAIGN_NOT_FOUND` | The campaign does not exist or has not started. |
| 409 | `CAMPAIGN_NOT_OPEN` | The campaign has ended. |
| 502 | `PAYMENT_PROVIDER_ERROR` | Salesforce could not create the PaymentIntent. Safe to retry. |
| 500 | `INTERNAL_ERROR` | Anything else. No details. |

Field codes: `REQUIRED`, `INVALID_FORMAT`, `TOO_LONG`, `AMOUNT_BELOW_MINIMUM`, `BANNED_WORD`, `NOT_ALLOWED` (for example `publicName` sent by an anonymous donor).

### After the session
1. The web app calls Stripe.js `confirmPayment` with the `clientSecret` and the card field.
2. On return, the thank-you page calls Stripe.js `retrievePaymentIntent` with the same `clientSecret` and words its message by the status. A `succeeded` status does not mean Salesforce has recorded the donation yet, so the page says the donation is being confirmed (`RF-D4`). No other endpoint is needed.

## 4. PaymentIntent metadata

Only Salesforce writes metadata, when it creates the PaymentIntent. The web app never sends metadata to Stripe. Salesforce reads it back from the `payment_intent.succeeded` event to create the records, so these keys are the second half of the contract.

Rules: every value is a string; booleans are `"true"` or `"false"`; a key that does not apply is left out, never sent empty; keys are lowercase with underscores; each value is at most 500 characters (Stripe's limit).

| Key | Value | Present when | Becomes |
| :--- | :--- | :--- | :--- |
| `schema_version` | `"1"` | Always | Lets the reader reject a layout it does not know. |
| `campaign_id` | Campaign ID | Always | Opportunity `CampaignId` |
| `donor_email` | Email | Always | Contact, receipt address |
| `is_anonymous` | `"true"` or `"false"` | Always | `Is_Anonymous__c` |
| `public_name` | Display name | Credited only | `Public_Name__c` |
| `invoice_requested` | `"true"` or `"false"` | Always | Decides whether an `Invoice_Request__c` is created |
| `invoice_full_name` | Full name | Invoice requested | `Legal_Name__c` |
| `invoice_rfc` | RFC | Invoice requested | `RFC__c` |
| `invoice_taxpayer_type` | `"individual"` or `"company"` | Invoice requested | `Taxpayer_Type__c`; `"company"` also creates an Account |
| `invoice_postal_code` | 5 digits | Invoice requested | `Postal_Code__c` |
| `invoice_tax_regime` | SAT code | Invoice requested | `Tax_Regime__c` |
| `invoice_cfdi_use` | SAT code | Invoice requested | `Cfdi_Use__c` |
| `invoice_email` | Email | Invoice requested | `Invoice_Email__c` |

Other PaymentIntent settings Salesforce applies:
- `amount` in centavos and `currency` `mxn`. The recorded amount always comes from the event, never from metadata.
- Card as the only payment method.
- `receipt_email` is not set. Salesforce sends the receipt itself.
- A description such as `Donativo - {campaign name}`.

Stripe events Salesforce handles at its webhook: `payment_intent.succeeded` creates the records; `payment_intent.payment_failed` is only logged. Details: [solution-architecture.md](requirements/architecture/solution-architecture.md).

## 5. Working apart

- **Web app:** run against a mock server that returns the examples above, including each error code. The mock is the contract in executable form; keep it in the web app repository.
- **Salesforce, E1:** `POST /payment-sessions` validates exactly as in section 3 and returns a placeholder `clientSecret` and `paymentIntentId`. The real Stripe callout is added in E2 without changing the contract.
- **Salesforce:** write tests with the same examples. For the webhook, use a sample `payment_intent.succeeded` event whose metadata follows section 4, so the recording logic is tested without Stripe.
- **Changes:** edit this page and the mock or tests in the same pull request, and have one person from each side approve it.
