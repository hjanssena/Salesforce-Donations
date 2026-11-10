# Security (Seguridad)

The security proof for the Mexico Dreamin Donation Portal: what an unauthenticated visitor can and cannot do, why the Guest User has the access it has, how secrets stay out of the repository, how personal data is classified, and the risks that remain. Required by `RF-V2`, the minimums `M1` to `M3` and criterion `C5`. Structure from [security-privacy.md](requirements/architecture/security-privacy.md), section 4.

| | |
| :--- | :--- |
| **Org** | Class sandbox `class2026h` (shared with other teams) |
| **Public site** | Salesforce Site `donations`, served at the domain root: `{SF_SITE_URL}` = `https://uady--class2026h.sandbox.my.salesforce-sites.com` |
| **Guest User** | `donations Usuario invitado al sitio Web`, profile `donations Perfil` |
| **Last checked** | 2026-11-10 (configuration read from the org; live tests in section 1.3 run by Esmeralda from a machine with no Salesforce session) |

---

## 1. Reproducible Guest User test (`RF-V2`, `M2`)

Anyone on the team can repeat these steps. The tests never use a real record: the write attempts use a made-up record ID, so a failure of the protection cannot change another team's or another donor's data.

### 1.1 Check the configuration in Setup

1. **Setup → Sites → `donations` → Public Access Settings.** This opens the guest profile `donations Perfil`.
2. **Object Settings:** every object must show *No Access*. Look at Opportunity, Campaign, Contact, Account, Invoice Request and Stripe Event in particular.
3. **System Permissions:** *API Enabled*, *View All Data* and *Modify All Data* must be off.
4. **Enabled Apex Class Access:** only the team's `@RestResource` classes (section 2).

Equivalent check from the CLI (read only):

```bash
sf data query -o class2026h -q "SELECT COUNT() FROM ObjectPermissions WHERE Parent.Profile.Name='donations Perfil'"
# expected: 0

sf data query -o class2026h -q "SELECT PermissionsApiEnabled, PermissionsViewAllData, PermissionsModifyAllData FROM Profile WHERE Name='donations Perfil'"
# expected: false, false, false
```

### 1.2 Run the visitor tests

Run each command from any computer, with no Salesforce session. `FAKE_ID` is a well-formed Opportunity ID that does not exist.

```bash
SITE=https://uady--class2026h.sandbox.my.salesforce-sites.com
V=v64.0
FAKE_ID=006000000000000AAA

# 0. Control: the public API answers
curl -s -w "\n%{http_code}\n" "$SITE/services/apexrest/donations/v1/health"

# Read attempts (CA1)
curl -s -w "\n%{http_code}\n" "$SITE/services/data/$V/query?q=SELECT+Id,Amount+FROM+Opportunity"
curl -s -w "\n%{http_code}\n" "$SITE/services/data/$V/query?q=SELECT+RFC__c+FROM+Invoice_Request__c"
curl -s -w "\n%{http_code}\n" "$SITE/services/data/$V/sobjects/Opportunity/$FAKE_ID"
curl -s -w "\n%{http_code}\n" -X POST -H "Content-Type: application/json" \
  -d '{"query":"query{uiapi{query{Opportunity{edges{node{Id}}}}}}"}' "$SITE/services/data/$V/graphql"
curl -s -w "\n%{http_code}\n" -X POST "$SITE/aura?r=1"
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "$SITE/$FAKE_ID"

# Write attempts (CA2)
curl -s -w "\n%{http_code}\n" -X PATCH -H "Content-Type: application/json" \
  -d '{"Amount":1}' "$SITE/services/data/$V/sobjects/Opportunity/$FAKE_ID"

# Create a donation without paying (CA3)
curl -s -w "\n%{http_code}\n" -X POST -H "Content-Type: application/json" \
  -d '{"Name":"Security test","StageName":"Closed Won","CloseDate":"2026-11-10","Amount":1}' \
  "$SITE/services/data/$V/sobjects/Opportunity"
```

### 1.3 Expected and actual results

| # | Attempt | Criterion | Expected | Actual |
| :--- | :--- | :--- | :--- | :--- |
| 0 | `GET /services/apexrest/donations/v1/health` | Control | `200` and `{"status":"ok"}` | ✅ `200` `{"status":"ok"}` |
| 1 | SOQL query on Opportunity | CA1 | Rejected (`401` or `403`, no records) | ✅ `401` `INVALID_SESSION_ID` |
| 2 | SOQL query on `RFC__c` | CA1 | Rejected, no RFC returned | ✅ `401` `INVALID_SESSION_ID` |
| 3 | Read one Opportunity by ID | CA1 | Rejected, no fields returned | ✅ `401` `INVALID_SESSION_ID` |
| 4 | GraphQL query on Opportunity | CA1 | Rejected, no records | ✅ `403` `API_DISABLED_FOR_ORG` (API not available to the guest) |
| 5 | Aura endpoint | CA1 | Not available on a Salesforce Site (`404`) or rejected | ✅ `401` `aura:invalidSession` |
| 6 | Record URL `/{id}` on the site | CA1 | Redirect to login or "page not found", no data | ✅ The site's HTML page, no record data (status code to be noted on the next run) |
| 7 | Update an Opportunity | CA2 | Rejected | ✅ `401` `INVALID_SESSION_ID` |
| 8 | Create an Opportunity without payment | CA3 | Rejected, nothing created | ✅ `401` `INVALID_SESSION_ID` |

**Run on 2026-11-10 by Esmeralda: all 8 attempts failed and no donation, donor or RFC data was returned (CA1, CA2, CA3 met).** When repeating the test, update this column with the new status codes and date, and attach a screenshot of the terminal (with no secrets in it) to issue #19.

The Apex tests described in [salesforce-api.md](salesforce-api.md), section 8 (`System.runAs` with the site's guest user), will repeat checks 1, 3 and 8 automatically once the API classes are in the repository.

---

## 2. Guest User privileges and why

| Access | Value on `donations Perfil` | Why |
| :--- | :--- | :--- |
| Object permissions | **None** on every object (0 rows, checked 2026-11-10) | The visitor must not read or write any record directly (`M2`, `S15`). |
| API Enabled, View All Data, Modify All Data | **Off** | No standard REST, SOQL or GraphQL access. |
| Apex class access | `HealthResource` only, today | Connection check for CORS (#39). The contract's classes (`CampaignsResource`, `PaymentSessionsResource`, `StripeWebhookResource`) are added as they are built, and nothing else. |
| How campaigns are read | One `without sharing` selector that returns only the contract's fields | It never selects `Email`, `RFC__c` or any invoice field ([salesforce-api.md](salesforce-api.md), section 2). |
| How donations are written | Only by the webhook service, after the Stripe signature check | A visitor cannot create a donation without a successful payment (CA3). |
| Field permissions | Inherited rows exist on standard and NPSP fields, but none on this project's custom fields | They grant nothing while the profile has no object access. See residual risk R2. |
| Sharing defaults | Guest users are always treated as Private by Salesforce's secure guest access | The org's external defaults for Opportunity, Contact and Account are Public Read/Write; this does not reach the guest, but see R3. |

### Staff access (team roles)

Staff do not use the guest profile. Each role is a permission set, following [roles.md](requirements/admin/roles.md):

| Permission set | Campaigns | Donations | Donor data | Invoice data and RFC | Stripe notices |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Campaign_Manager` | Read, create, edit | Read | Read | Read | None |
| `Moderator` | Read | Read; edit only Public Name and Display Status | Read (email read-only) | **None** | None |
| `Donations_Admin` | Read, create, edit | Read, create, edit | Read, create, edit | Read, create, edit | Read only |

No role can delete donations, invoice requests or notices, so the record of every donation is kept.

---

## 3. Secrets (`M3`)

| Secret | Where it lives | Never in |
| :--- | :--- | :--- |
| Stripe Secret Key (test) | External Credential principal in the org, entered by hand ([salesforce-api.md](salesforce-api.md), section 6) | Code, metadata, Git, screenshots, logs, AI prompts |
| Stripe Webhook Signing Secret | Protected custom setting, entered by hand | Same |
| Stripe Publishable Key | Web app environment variable on the server | Git (only `.env.example` files with placeholders are tracked) |

How it is checked:

- `.gitignore` excludes `.env`, `.env.*` (except the examples), `*.pem`, `*.key`, `*.crt` and any path containing `secret`.
- Git history scan, run on 2026-11-10 over every branch, found **0** Stripe keys or webhook secrets:

  ```bash
  git log --all -p | grep -cE "sk_(test|live)_[A-Za-z0-9]{10,}|whsec_[A-Za-z0-9]{10,}|rk_(test|live)_[A-Za-z0-9]{10,}"
  # expected: 0
  ```

- The retrieved metadata in `force-app/` contains no keys (same pattern, run before each metadata pull request).
- Pull request reviewers tick the *Zero Secrets* item in [branching-and-merge-strategy.md](workflow/branching-and-merge-strategy.md).

If a secret leaks: rotate it in Stripe the same day, purge it from the repository and its history, and tell the professor ([security-privacy.md](requirements/architecture/security-privacy.md), section 1).

---

## 4. Personal data classification (`OA6`)

| Data | Where | Class | Who sees it | Public? | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Display name | `Opportunity.Public_Name__c` | Personal | Staff; public when credited and Visible | Yes, if the donor chose recognition | Not asked from anonymous donors. Checked against banned words; a moderator can hide it. |
| Anonymous choice | `Opportunity.Is_Anonymous__c` | Operational | Staff | No | |
| Donation amount | `Opportunity.Amount` | Financial | Staff; public next to a credited name and as campaign progress | Partly | |
| Donor name | `Contact` | Personal | Staff (all three roles) | No | Anonymous donors keep a contact for the receipt. |
| Email | `Contact.Email` | Personal, confidential | Staff (all three roles) | **Never** | Only for the receipt. Only team-owned addresses in tests. |
| Legal name, postal code, tax regime, CFDI use | `Invoice_Request__c` | Fiscal | Admin and Campaign Manager | **Never** | Asked only when an invoice is requested. |
| RFC | `Invoice_Request__c.RFC__c` | Sensitive (tax ID) | Admin and Campaign Manager | **Never** | Format checked by a validation rule. Travels in the PaymentIntent metadata until the donation is recorded, so only fictitious RFCs are used (`M1`). |
| Invoice email | `Invoice_Request__c.Invoice_Email__c` | Personal, confidential | Admin and Campaign Manager | **Never** | |
| Stripe PaymentIntent ID, event ID | `Opportunity`, `Stripe_Event__c` | Operational | Staff | No | References only. |
| Card number, CVV, expiry | Not stored | Payment | Stripe only | — | The card field sends it straight to Stripe; Salesforce never sees it. |
| Full webhook payload | Not stored | — | — | — | Only the event ID, type, status and reason are kept. |

---

## 5. Residual risks

| # | Risk | Impact | Current mitigation | What is left |
| :--- | :--- | :--- | :--- | :--- |
| R1 | **Public form spam or flooding** (bots asking for many payment sessions) | Noise in Stripe, governor limits, wasted emails | No donation exists until Stripe confirms a payment; the payment session validates every field; Stripe applies its own rate limits | No CAPTCHA or per-IP limit on the payment session endpoint. Consider one if abuse appears. |
| R2 | Inherited field permissions on the guest profile (930 rows on standard and NPSP fields) | Would expose those fields if someone later gave the guest object access | Object access is none, so they grant nothing today | Clean the guest profile's field permissions. |
| R3 | Shared sandbox: other teams' administrators can see this team's records; org external sharing defaults are Public Read/Write | Test data visible to other students | Only fictitious data (`M1`); secure guest access keeps the guest Private | Cannot be fixed by the team; changing defaults would affect the other teams. Agree a Record Type per team with the professor. |
| R4 | Card-testing (fraudsters trying stolen cards through the form) | Fees and disputes in a live account | Test Mode only (`M1`); Stripe Radar in live mode | Out of scope while in Test Mode. |
| R5 | Offensive public names | Reputation | Banned-words list and the Moderator role (`RF-C2`) | Words not on the list get through until a moderator hides them. |
| R6 | RFC in Stripe metadata | Tax ID stored outside Salesforce | Fictitious RFCs only; metadata is not public | Revisit before any real use. |
| R7 | The self-hosted web server goes down | Site unavailable during the demo | Docker restart policy, TLS with certbot | No second host. |
| R8 | Daily email limit of the sandbox | Receipts or invoices not sent | Low volume in tests | Check before the demo (#47). |

---

## 6. Webhook security (E2)

To be completed in E2 with `RF-V3a` and `RF-V3b`: signature check of `Stripe-Signature` with the signing secret and a 5-minute tolerance, and deduplication through the unique `Stripe_Event__c.Stripe_Event_Id__c` and `Opportunity.Stripe_Payment_Intent_Id__c`.
