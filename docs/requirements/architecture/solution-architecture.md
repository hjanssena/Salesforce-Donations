# Architecture — Solution Architecture

This document describes how the services connect and how the project's models map to Salesforce objects. It records the team's proposal and the decisions already taken; the requirements it serves live in [README.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/README.md).

---

## 1. Services

| Service | Role | Hosting |
| :--- | :--- | :--- |
| **React web app** | Donor-facing site. Shows campaigns and supporters, collects donor details, and shows the Stripe card field. | Docker on a team-owned server, own domain, TLS certificate from certbot. Approved by the professor. |
| **Salesforce Developer Edition org** | Backend and database. Public API for the web app, payment sessions, webhook endpoint, emails, and the staff Lightning app. | Salesforce |
| **Stripe (Test Mode)** | Takes the card, confirms the payment, and notifies Salesforce by webhook. | Stripe |

```mermaid
flowchart LR
  subgraph Donor["Donor's browser"]
    App["React web app"]
    Card["Stripe.js card field"]
  end
  subgraph SF["Salesforce org"]
    API["Public API (Apex REST, guest user)"]
    Session["Payment session service (Named Credential)"]
    Hook["Webhook endpoint (Apex REST)"]
    Records[("Campaign, Opportunity, Contact, Account, Invoice_Request__c, Stripe_Event__c")]
    Staff["Lightning app for staff"]
    Mail["Receipt and invoice emails"]
  end
  Stripe["Stripe (test mode)"]
  Inbox["Donor's inbox"]

  App -->|"1 read campaigns, supporters"| API
  App -->|"2 start payment"| API
  API --> Session
  Session -->|"3 create PaymentIntent"| Stripe
  API -->|"4 client secret"| App
  Card -->|"5 card details"| Stripe
  Stripe -->|"6 webhook event"| Hook
  Hook -->|"records donation"| Records
  Hook --> Mail
  Mail -.->|"7 receipt, 8 invoice if requested"| Inbox
  Staff --- Records
```

### Payment flow
1. The web app asks the public API for open campaigns and the supporters list.
2. The donor fills in the form. The app asks for a payment session with amount, campaign, recognition choice, invoice choice and donor details.
3. Salesforce creates a Stripe PaymentIntent and stores those details in its metadata. No donation record exists yet.
4. Salesforce returns the client secret to the app.
5. The card field sends the card to Stripe. Salesforce never sees card data.
6. Stripe posts `payment_intent.succeeded` to the webhook endpoint. Salesforce checks the signature, ignores events it already logged, and creates the donation. Failed payments and bad notices go to the event log only.
7. Salesforce emails the receipt.
8. Salesforce emails the invoice, only when the donor requested one.

### How Salesforce knows who a donation belongs to
The display name and the invoice data are separate: the first exists only for credited donors, the second only when an invoice is requested. The donor details are validated in step 2 and attached to the PaymentIntent as metadata in step 3. The `payment_intent.succeeded` event in step 6 carries the full PaymentIntent, so the webhook has everything it needs without a stored draft.

The exact keys, values and rules are defined in [contract.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/contract.md) (section 4), which is the single source. In short: campaign, anonymity flag, donor email and invoice flag always; the display name only for credited donors; the seven invoice items only when an invoice is requested.

On `payment_intent.succeeded`, Salesforce verifies the signature, then in one transaction:
1. Finds or creates the Contact by email, and the Account when the invoice's taxpayer type is a company. The Contact is named from the invoice legal name, else the display name, else "Anonymous donor".
2. Creates the Opportunity (Closed Won) with the campaign, the amount from the event, the anonymity flag and the PaymentIntent ID.
3. Creates the `Invoice_Request__c` when the metadata carries invoice data.
4. Logs the event in `Stripe_Event__c`, then sends the receipt and, if requested, the invoice.

Why this is safe and where it stops:
- The browser holds only the client secret. It can confirm the payment but cannot change the metadata or the amount, so Salesforce trusts what it validated itself.
- Stripe allows 50 metadata keys, 500 characters per value; these fields fit.
- The details stay in Stripe's test account, so only fictitious data is allowed.
- If creating the records fails, the endpoint answers with an error so Stripe retries. The unique PaymentIntent ID on the Opportunity makes the retry safe.

### Decisions taken
- **Web app hosting:** outside Salesforce, on the team's server. The org allows only that origin through CORS.
- **No Pending record:** a donation is created only after a successful payment. Donor details, including the RFC, travel in the PaymentIntent metadata. This differs from `RF-D3` in `lineamientos.md`; the professor confirmed it is acceptable and that the guideline's wording was wrong.
- **Receipt by Salesforce:** Stripe sends no receipt emails in test mode, so Salesforce sends the receipt and the invoice. The Developer Edition daily email limit must be checked.
- **Site language and currency:** the site and emails are in Spanish; amounts are in MXN, with a 50 MXN minimum and no maximum.
- **Campaigns stay open past 100%:** a campaign closes only on its end date.
- **Donation object:** the standard Opportunity, not a custom `Donation` object.
- **Invoice as its own object:** `Invoice_Request__c` is a child of the donation, for its own status, reissues and RFC isolation.
- **No Payment object for now:** a donation exists only after one successful payment, so it has one PaymentIntent. `Stripe_Event__c` keeps the attempt history. A Payment object becomes worthwhile if refunds, stored failed attempts, or more Stripe data (charge, fees) enter scope.

### Open technical checks
How each is set up and tested, with fallbacks: [salesforce-api.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/salesforce-api.md).
- ~~The Guest User can call the Apex REST API from the team's origin (CORS on a public site).~~ Confirmed on 2026-11-06 ([salesforce-api.md](../../salesforce-api.md), section 4).
- The webhook endpoint is reachable by Stripe through the public site.
- The Developer Edition daily email limit covers the demo.
- Resolved by the delivery plan: E1 records donations from a sample event, E2 connects the real webhook. Earlier open question: whether the E1 deliverable confirms the payment without the webhook (for example, Salesforce asks Stripe for the payment status when the donor returns). Recording must be idempotent on the Stripe payment ID so both paths can coexist.

---

## 2. Data Model

Standard objects are reused wherever one fits. Custom fields on standard objects are marked `+`.

```mermaid
erDiagram
  Campaign ||--o{ Opportunity : "CampaignId"
  Opportunity }o--|| Contact : "contact role"
  Contact }o--o| Account : "AccountId"
  Opportunity ||--o{ Invoice_Request__c : "Opportunity__c"
  Opportunity ||--o{ Stripe_Event__c : "Opportunity__c"

  Campaign {
    string Name
    string Description
    date StartDate
    date EndDate
    boolean IsActive
    currency ExpectedRevenue "goal"
    currency AmountWonOpportunities "raised, roll-up"
    string Purpose__c "+"
    url Image_Url__c "+"
  }
  Opportunity {
    string Name
    currency Amount
    date CloseDate
    string StageName "always Closed Won"
    string Stripe_Payment_Intent_Id__c "+ unique"
    boolean Is_Anonymous__c "+"
    string Public_Name__c "+"
    string Display_Status__c "+"
    string Source__c "+"
  }
  Contact {
    string Name
    email Email
  }
  Account {
    string Name "company donors only"
  }
  Invoice_Request__c {
    string Legal_Name__c "full name"
    string RFC__c "sensitive"
    string Taxpayer_Type__c
    string Postal_Code__c
    string Tax_Regime__c
    string Cfdi_Use__c
    email Invoice_Email__c
    string Status__c "Requested, Sent, Failed"
    string Invoice_Type__c "no CFDI today"
    datetime Sent_At__c
  }
  Stripe_Event__c {
    string Stripe_Event_Id__c "unique"
    string Payment_Intent_Id__c
    string Type__c
    string Status__c
    string Reason__c
    datetime Received_At__c
  }
```

`Banned_Word__mdt` (custom metadata, field `Word__c`) holds the words refused in display names. Moderators and admins maintain the list.

| Project term | Salesforce | Note |
| :--- | :--- | :--- |
| Campaign, goal, dates | Campaign | Goal in `ExpectedRevenue`. Completed means the end date passed; reaching the goal does not close a campaign. |
| Donation | Opportunity | Staff-entered donations use the same object with `Source__c` = Manual. |
| Donor, company | Contact, Account | Matched by email to avoid duplicates. Anonymous donors keep their email, which is never public. |
| Progress toward goal | Campaign roll-up | Simultaneous payments both count, so a campaign can end above 100%. |
| Anonymous or credited | `Is_Anonymous__c` | Two independent choices with the invoice request. The supporters list shows donations that are not anonymous and are Visible. |
| Hide or correct a name | `Public_Name__c`, `Display_Status__c` | Hidden donations still count toward the goal. |
| Invoice request | `Invoice_Request__c` | Child of the donation. Has its own status, can be reissued (1 donation to N invoices), keeps the RFC behind its own permission set, and avoids empty invoice fields on most donations. `Invoice_Type__c` leaves room for CFDI later. The donor gives five SAT items (full name, RFC, postal code, fiscal regime, fiscal use); the invoice fills in the rest (description, quantity 1, amount, single payment, card) from the donation. |
| Notice log, duplicate check, attempt history | `Stripe_Event__c` | Logs every Stripe notice, including failed payments, with the PaymentIntent ID. No standard object holds a staff-readable integration log. |
| Admin, campaign manager, moderator | Three permission sets | See [roles.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/roles.md). The Guest User gets no permissions on these objects. |
