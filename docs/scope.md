# Project Scope — Mexico Dreamin Donation Portal

This is the short answer to "what are we building and what are we not". Each feature points to the user stories that define it; the stories in [requirements/](requirements/README.md) are the source of truth for behavior. How it is built is in [architecture.md](architecture.md).

> [!IMPORTANT]
> This is an academic simulation. Stripe runs in Test Mode, all money and personal data are fictitious, and no real CFDI is issued.

## What the program is

A donation portal for Mexico Dreamin. Visitors browse fundraising campaigns and donate without an account. The team that runs the program manages campaigns and donations in Salesforce.

## Features

### Public site (Spanish, MXN, no login)

| Feature | Rules | Stories |
| :--- | :--- | :--- |
| Browse campaigns | Open campaigns show name, description, image, purpose, deadline, goal and progress. One open campaign opens directly; none shows a message. Completed campaigns are in a separate view. | `RF-V1`, `RF-D1a`, `RF-D1c` |
| Donate | Suggested amounts 100, 250, 500, 1,000, 2,000, 5,000, 10,000, 20,000 MXN, or any custom amount. Minimum 50 MXN, no maximum. | `RF-D1a`, `RF-D1b` |
| Choose recognition | Anonymous (email only) or credited (display name and email). Credited names appear on the campaign's supporters list with their amount. | `RF-D2`, `RF-C1` |
| Request an invoice | Independent of recognition. The donor gives full name, RFC, postal code, fiscal regime, fiscal use, and whether they donate as an individual or a company. Salesforce emails the invoice. | `RF-F1`, `RF-F3` |
| Pay by card | Stripe Test Mode. The card goes straight to Stripe. | `RF-D3` |
| Thank-you page and receipt | The page does not claim confirmation before the donation is recorded. Salesforce emails the receipt. | `RF-D4`, `RF-D5` |

### Team tools (Salesforce)

| Feature | Rules | Stories |
| :--- | :--- | :--- |
| Campaign management | Campaign managers create campaigns with a required image and a goal. The goal is locked once the campaign starts. A campaign keeps receiving donations past 100% and closes only on its end date. | `RF-S1`, `RF-S1b` |
| Donation overview | All three roles see every donation, anonymous donors included. | `RF-S2` |
| Invoice requests | Flagged and filterable. Only admins and campaign managers see the RFC. | `RF-F2` |
| Manual donations | Admins enter donations received outside the site. Same 50 MXN minimum, no email sent. | `RF-S3` |
| Name moderation | Moderators hide or correct display names and maintain banned words with admins. Emails are read-only. | `RF-C2` |
| Roles | Admin, Campaign Manager and Moderator, each with its own permission set. | `RF-S5` |
| Payment notices | Stripe webhooks record donations automatically, accept only signed notices, ignore repeats, and log rejected ones for admins. | `RF-V3a`, `RF-V3b`, `RF-S4` |

### Security and documentation

- The Guest User has no object permissions; it only calls the public API (`RF-V2`, `M1–M3`).
- Personal data is classified, and security tests are documented in `docs/seguridad.md`.

## What we are not doing

- Real payments, a live Stripe account, or real money.
- Real CFDI tax receipts or any call to the live SAT service. The invoice is an email with the SAT data; the RFC is only checked against its pattern.
- Donor accounts or login, and direct allocation of funds to individual students.
- Refunds and mistaken-payment handling.
- Donations received outside the site, apart from manual entry by an admin.
- Bank reconciliation against Stripe statements, and student-level metrics or dashboards.
- Languages other than Spanish.
- Real personal data.
- Legal terms of service, formal privacy notices, or regulatory compliance frameworks.
- Anti-spam protection. It is documented as a residual risk and is not graded.
- Pending or draft donation records. A donation exists only after a verified successful payment.
- Stored failed payment attempts as donations. Stripe notices of failed payments go to the event log only.

## Delivery plan

Front and back are built apart against [contract.md](contract.md) and joined in the second delivery.

| | Delivery 1 (E1, Nov 10): working apart | Delivery 2 (E2, Nov 17): joining |
| :--- | :--- | :--- |
| **Web app** | Deploy to the team server with TLS; mock server from the contract; campaigns, donation form (suggested amounts), recognition and invoice choices, card field on a mock secret, thank-you page, Spanish copy. (`RF-V1`, `RF-D1a`, `RF-D2`, `RF-C1`, `RF-F1`, `RF-D4`) | Connect to the real endpoints; custom amounts; completed campaigns view and no-open-campaign message; auto-scrolling supporters list; banned-word errors. (`RF-D1b`, `RF-D1c`, `RF-C1`) |
| **Salesforce, data and staff app** | Data model; three permission sets; Guest User without object permissions; campaign management (campaigns are shown open or completed by their dates); donation list; invoice flag and filter; manual donations. (`RF-S5`, `RF-V2`, `RF-S1`, `RF-S2`, `RF-F2`, `RF-S3`) | Closing campaigns on their end date; name moderation and banned words; rejected notices log. (`RF-S1b`, `RF-C2`, `RF-S4`) |
| **Salesforce, API and payments** | Connection check from the deployed web app; campaign endpoints; payment session endpoint that validates the request and returns a placeholder `clientSecret`, with tests; recording service driven by a sample `payment_intent.succeeded` event, safe to repeat; `docs/seguridad.md`. (`RF-D3`) | Named Credential and the real Stripe PaymentIntent callout behind the payment session endpoint; Stripe webhook with signature check and duplicate handling; receipt and invoice emails; end-to-end test with test cards; email limit check. (`RF-V3a`, `RF-V3b`, `RF-D5`, `RF-F3`) |
| **Everyone** | Contract approved; professor's answer on `RF-D3`; demo video. | End-to-end demo and defense preparation. |

Staffing: two people work on Salesforce in E1, one on data model, roles and the staff app, the other on the API and recording service. The web app owner picks up declarative Salesforce items (permission sets, list views, page layouts, the invoice filter) once the UI is steady, and the E2 emails and moderation.

If E1 slips, cut in this order: invoice form polish, manual donations (`RF-S3`), staff donation filters. Keep campaigns, the donation form, roles and the recording service.

## Open points

| Point | Needed from |
| :--- | :--- |
| `lineamientos.md` `RF-D3` mentions a pending record; the team creates none. | Professor |
| Whether the invoice needs a tax breakdown (`RF-F3`). | Stakeholder |
| Whether manual donations are allowed for completed campaigns, and whether credited manual entries appear on the supporters list (`RF-S3`). | Stakeholder |
| Whether the Guest User can call the Apex REST API from the team's origin, whether Stripe can reach the webhook, and whether the Developer Edition email limit covers the demo. | Team, by testing |
| Whether Stripe sends no receipt emails in test mode (assumed). | Team, by testing |
