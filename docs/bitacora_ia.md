# AI Logbook (Bitácora de IA)

Formal record of how the team used AI tools, evaluated under criterion **C3** in E1 and E2. Each entry keeps the nine fields required in [ai-and-documentation-logging.md](workflow/ai-and-documentation-logging.md). Entries marked **AI error** count toward the minimum of three documented cases where the AI was wrong and the team caught and fixed it. For the full chronological, atomic log of every AI-assisted change in the repository, see our AI Change Log at [AI/log.md](../AI/log.md).

All three team members add their own entries. Never paste secrets, tokens or real personal data into a prompt or into this log.

## Summary

| #   | Date       | Author         | RF                                                 | AI error                                                                            |
|:--- |:---------- |:-------------- |:-------------------------------------------------- |:----------------------------------------------------------------------------------- |
| 1   | 2026-11-07 | Esmeralda      | RF-S5, RF-F2                                       | Yes: data model contradicted the agreed architecture                                |
| 2   | 2026-11-10 | Esmeralda      | RF-C1, RF-C2                                       | Yes: picklist values copied as a single broken value                                |
| 3   | 2026-11-10 | Esmeralda      | RF-S3, RF-S5, RF-S1                                | Yes: setup guide missed record types; found by automated tests                      |
| 4   | 2026-11-05 | Janssen        | RF-D1a, RF-D2, RF-D3, RF-C1, RF-F1                 | Yes: anonymous `publicName: null` and banned-word matching ambiguity caught in #31  |
| 5   | 2026-11-06 | Janssen        | RF-D1a, RF-D1b, RF-D1c, RF-D2, RF-D4, RF-C1, RF-F1 | Yes: 15s load timeout fired after data loaded (PR #88)                              |
| 6   | 2026-11-06 | Janssen        | RF-V1, M1, M3                                      | Yes: arm64 QEMU crash during Docker `npm ci` in CI deploy (PR #80)                  |
| 7 | 2026-11-10 | Jesus Estrella | RF-V1; issues #20 and #39; M2 and S11 guardrails | Yes: unsupported guest-profile metadata assumptions |
| 8 | 2026-11-10 | Jesus Estrella | RF-D1a, RF-D1c and RF-S1b; issues #21, #23 and #10 | No separate AI error documented for this function |
| 9 | 2026-11-10 | Jesus Estrella | RF-D3 and RF-D1b; issues #40 and #22; S11 and S14 | No separate AI error; provider-status correction is in entry 17 |
| 10  | 2026-11-16 | Esmeralda      | RF-C2, RF-S4                                       | Yes: flow file used an element name that does not exist; caught by deploy validation |
| 11  | 2026-11-17 | Janssen        | RF-D5, RF-F3                                       | Yes: email plan assumed a Developer Edition org; the project runs on an Enterprise sandbox |
| 12  | 2026-11-17 | Janssen        | RF-D5                                              | Yes: receipt addressed to a Contact the site guest cannot read; every live send failed |
| 13 | 2026-11-10 | Jesus Estrella | RF-D3; issue #24; S11, S12 and S14 | Yes: shared-org assumptions and unwanted verification artifacts |
| 14 | 2026-11-17 | Jesus Estrella | RF-D2; issue #27; integration with RF-F1 | No new AI error documented for this function |
| 15 | 2026-11-16 | Jesus Estrella | RF-C1; issues #28 and #31; merged PR #99 | Yes: substring matching diverged from the whole-token contract |
| 16 | 2026-11-17 | Jesus Estrella | RF-F1; issue #29; recorder integration with issue #24 | Inherited automation failure; diagnosis corrected in entry 22 |
| 17 | 2026-11-17 | Jesus Estrella | RF-D3; issue #45; merged PR #103 | Yes: unsupported assertion/status and missing credential enablement |
| 18 | 2026-11-17 | Jesus Estrella | RF-D3; issue #45; merged PR #103 | Yes: lowercase retry header lost through case-sensitive lookup |
| 19 | 2026-11-17 | Jesus Estrella | RF-V3a; issues #11 and #46; merged PR #104 | CLI authorization limitation; user completed interactive login |
| 20 | 2026-11-17 | Jesus Estrella | RF-V3b; issue #12; RF-V3a rejection integration for issue #11 | Yes: unavailable Crypto API and incorrect permission assertion |
| 21 | 2026-11-17 | Jesus Estrella | RF-D3 and RF-V3a; issues #24 and #11; shared-org risk R9 | Inherited trigger dependency; new assertion context corrected |
| 22 | 2026-11-17 | Jesus Estrella | RF-D3 and RF-F1; issues #24 and #29; RF-V3a integration | Yes: initial invoice diagnosis and handler sharing declaration |
| 23 | 2026-11-17 | Jesus Estrella | RF-D3, RF-D2, RF-C1 and RF-F1; shared issue #44 and issues #24, #27, #28, #29 | Yes: email readiness and ownership assumptions corrected |

---

## How We Used AI (`OA3`, `C3`)

We used AI across the full lifecycle of the project under strict governance. Every session loads [AGENTS.md](../AGENTS.md) via [CLAUDE.md](../CLAUDE.md), which requires the assistant to read [scope.md](scope.md), [architecture.md](architecture.md), and [contract.md](contract.md) first, enforces course guardrails (no "how" in user stories, bulkified Apex, no hard-coded IDs, Guest User least privilege, zero secrets, English-only code/docs), and logs every change in [AI/log.md](../AI/log.md) (125 functional change entries across the team).

Across the team we used **Claude in Claude Code** (Janssen and Esmeralda) and **Codex (GPT-6.1)** (Jesus Estrella) in four areas:

1. **Consulting and requirements (`OA2`):** Split `lineamientos.md` into domain user stories, surfaced ambiguities, drafted stakeholder questions in business language, and aligned the backlog across multiple rounds of stakeholder Slack answers and meeting notes (donations created only after verified payment, independent anonymity and invoice toggles, 50 MXN minimum, three staff roles).
2. **Architecture and API contract:** Drafted the service architecture, Salesforce data model on standard objects, and [contract.md](contract.md) (`PR #8`, issue `#31`) so the React frontend and Salesforce backend could be built independently against shared request/response shapes, error codes, and `PaymentIntent` metadata.
3. **Implementation & verification:**
   - **Web app & deployment (Janssen — Claude in Claude Code):** Built the Vite + React + TypeScript app (`PR #72`, `#75–#77`, `#79`, `#81`, `#85–#88`, `#90`), an in-browser contract mock (`#34`), the two-step donation modal with Stripe's deferred Payment Element (`#35`, `#36`), the *Rótulo de Mérida* visual system ([PRODUCT.md](../PRODUCT.md), [DESIGN.md](../DESIGN.md)), and automated Docker CI/CD to a Raspberry Pi over ephemeral Tailscale SSH and Tailscale Funnel (`PR #74`, `#80`).
   - **Salesforce staff console & security (Esmeralda — Claude Code):** Built the custom fields, objects (`Invoice_Request__c`, `Stripe_Event__c`, `Banned_Word__mdt`), validation rules, permission sets, list views, reports, `Sent_At__c` flow, `StaffConsoleConfigurationTest` (19 tests), and reproducible Guest User security tests in [seguridad.md](seguridad.md) (`PR #82–#84`).
   - **Salesforce public API and payments (Jesus Estrella — Codex in VS Code):** Implemented the public REST API, validators, atomic DonationRecorder and isolated backend tests; aligned whole-token banned-word validation (PR #99), integrated real Stripe test PaymentIntents through Named Credentials (PR #103), and added signed, repeat-safe webhook recording and shared-sandbox compatibility guards (PR #104). The entries below separate functional outputs, actual verification and AI corrections; receipt/invoice email implementation is assigned to another contributor.
4. **Workflow automation:** Configured Husky + Commitlint, PR squash-merge documentation, and a GitHub Action (`PR #51`) that automatically moves tickets in GitHub Project `#6` from `Blocked` to `Todo` when dependencies close.

### Verification Methods

- **Against the repo's own docs:** Generated Setup guides and code were compared with [architecture.md](architecture.md) and [contract.md](contract.md) before uploading.
- **Read back from the org:** After each manual Setup step, the AI retrieved the metadata from the sandbox and compared it to the architecture plan.
- **Automated unit & integration tests:** Vitest suites for the web app (including regression tests that fail on the unpatched code) and isolated Apex test suites (`StaffConsoleConfigurationTest` with 19 role-based tests and `DonationBackendTest` with 12 methods at 98% coverage).
- **Static analysis & secret scanning:** PMD Security and Performance rules reported 0 findings on the backend; Git history was scanned to verify 0 exposed Stripe keys (`M3`).
- **Reproducible Guest User security probes:** Unauthenticated `curl` checks in [seguridad.md](seguridad.md) §1.2 verified that every direct read, update, and create attempt is rejected (`401`/`403`).
- **Cross-team contract verification:** Building the web app and Salesforce backend separately against [contract.md](contract.md) exposed edge cases on issue `#31` (`publicName: null` and banned-word matching) before connecting both halves.

---

## 1. Data model guide that contradicted the agreed architecture (AI error)

| Field                    | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|:------------------------ |:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Date**                 | 2026-11-07                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Author**               | Esmeralda                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **AI tool / model**      | Claude Code (Claude Opus 5.5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Requirement**          | RF-S5, RF-F2 (data model for part B)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Prompt**               | "Give me the steps for my part B." Then, one step at a time, "Done" to ask for the next object or field to create in Setup.                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Output obtained**      | A click-by-click guide to build the data model. It told me to create `Modality__c` (Anonymous / Credited / Invoiced) and a `Donor__c` lookup on Opportunity, `Source__c` with the values Stripe / Manual, and an invoice object without the SAT fields.                                                                                                                                                                                                                                                                                 |
| **Verification**         | Before uploading the metadata, I asked the AI what the team's repo was missing. It re-read the repo and compared the org against [architecture.md](architecture.md) and [solution-architecture.md](requirements/architecture/solution-architecture.md).                                                                                                                                                                                                                                                                                 |
| **Error found**          | The guide came from an older version of the plan. The agreed model uses an `Is_Anonymous__c` checkbox because anonymity and invoicing are independent choices; a single `Modality__c` picklist could not hold a donor who is anonymous and also asks for an invoice. The donor is linked through the Opportunity contact role, not a lookup. `Source__c` is Website / Manual. `Invoice_Request__c` also needs postal code, tax regime, CFDI use, invoice type and a Failed status, and `Stripe_Event__c` needs a lookup to Opportunity. |
| **Corrections applied**  | In the org: deleted `Modality__c` and `Donor__c`; created `Is_Anonymous__c`; renamed the Stripe value to Website; added the four SAT fields, the Failed status and the `Stripe_Event__c.Opportunity__c` lookup. The draft `data-model.md` the AI wrote was not uploaded, because it duplicated and contradicted the architecture docs.                                                                                                                                                                                                  |
| **Lesson**               | Check the guide against the repo's architecture docs before building, not after.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Estimated time saved** | About 2 hours of reading Salesforce documentation; about 30 minutes were spent on the corrections.                                                                                                                                                                                                                                                                                                                                                                                                                                      |

---

## 2. Display Status saved as one broken picklist value (AI error)

| Field                    | Detail                                                                                                                                                                                                                                                                                                                                                     |
|:------------------------ |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Date**                 | 2026-11-10                                                                                                                                                                                                                                                                                                                                                 |
| **Author**               | Esmeralda                                                                                                                                                                                                                                                                                                                                                  |
| **AI tool / model**      | Claude Code (Claude Opus 5.5)                                                                                                                                                                                                                                                                                                                              |
| **Requirement**          | RF-C1 (public donor wall), RF-C2 (moderate public names)                                                                                                                                                                                                                                                                                                   |
| **Prompt**               | "Done", after finishing Campaign, to ask for the next step: the Opportunity fields. The AI answered with a table that listed each picklist's values.                                                                                                                                                                                                       |
| **Output obtained**      | A table where the picklist values were separated by an HTML line break, shown as `Visible<br>Hidden`. I copied the cell into the picklist values box.                                                                                                                                                                                                      |
| **Verification**         | While preparing manual donations (RF-S3), I opened a new Donation form and sent a screenshot. The AI then read the field definition from the org.                                                                                                                                                                                                          |
| **Error found**          | `Display_Status__c` had a single value, `Visible<br>Hidden`, instead of two values, Visible and Hidden. The supporters list and the API (contract.md) filter on exactly `Visible`, so no donation could ever be hidden or shown correctly. All other picklists (Source, Invoice Status, Taxpayer Type, Stripe Event Status) were checked and were correct. |
| **Corrections applied**  | Edited the value to `Visible` (label and API name) and added a new value `Hidden`; Visible stays the default. The metadata in the repo was retrieved again with the fix.                                                                                                                                                                                   |
| **Lesson**               | When the AI gives picklist values, check that each one is on its own line before saving, and open the field afterwards to confirm the list of values.                                                                                                                                                                                                      |
| **Estimated time saved** | The step-by-step guide saved about 1 hour; the fix took about 10 minutes.                                                                                                                                                                                                                                                                                  |

---

## 3. Setup guide missed record types, found by automated tests (AI error)

| Field                    | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|:------------------------ |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Date**                 | 2026-11-10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Author**               | Esmeralda                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **AI tool / model**      | Claude Code (Claude Opus 5.5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Requirement**          | RF-S3 (manual donations), RF-S5 (roles), RF-S1 (campaigns)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Prompt**               | "I want to finish all the tests."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Output obtained**      | An Apex test class, `StaffConsoleConfigurationTest`, with 18 tests that create test users inside the test (no licenses used, nothing kept in the shared org), give them each role, and try the acceptance criteria with user-mode DML and describe calls. Run as a validation-only deploy.                                                                                                                                                                                                                                                     |
| **Verification**         | The first run failed 9 of 18 tests. Each failure was traced to its cause in the org.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Error found**          | The AI's earlier setup guide never covered record types. Campaign and Opportunity have record types in this org (NPSP and other teams), so: (1) the value **Manual** of `Source__c` was not enabled on the Donation record type, and nobody could have recorded a manual donation; (2) the three permission sets gave no record type access, so a user with only the Admin or Campaign Manager role could not create campaigns or donations. A third failure was the test's fault: Salesforce's own end-date check fires before the team rule. |
| **Corrections applied**  | By hand in Setup: enabled Manual (and Visible / Hidden, default Visible) on the Donation record type; gave Donations Admin the Campaign Default and Opportunity Donation record types, and Campaign Manager the Campaign Default record type. The test now accepts either end-date message. The AI's attempt to deploy the record type change itself was blocked, because that record type is shared with other teams, so the change was made by hand.                                                                                         |
| **Other finding**        | Another team's `OpportunityTrigger` runs on every Opportunity insert and adds the amount to their campaign "FONDOS SDU". Tests create that campaign to run; in the real org, this team's donations would also be added to that other team's fund. Raised with the team and recorded as residual risk R9 in `docs/seguridad.md`.                                                                                                                                                                                                                |
| **Lesson**               | Configuration that looks complete when checked as a System Administrator can still fail for a user with only the role. Test each role as that role.                                                                                                                                                                                                                                                                                                                                                                                            |
| **Estimated time saved** | Writing 18 tests by hand would take about 3 hours; the run and fixes took about 40 minutes.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

---

## 4. API contract between the web app and Salesforce (AI error)

| Field                    | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|:------------------------ |:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Date**                 | 2026-11-05 (updated 2026-11-10)                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Author**               | Janssen                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **AI tool / model**      | Claude in Claude Code                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Requirement**          | RF-D1a, RF-D2, RF-D3, RF-C1, RF-F1 (API contract and delivery split, PR #8, #90, issue #31)                                                                                                                                                                                                                                                                                                                                                 |
| **Prompt**               | Draft `docs/contract.md` so the React web app and Salesforce backend can be built apart, covering campaign reads, `POST /payment-sessions`, shared error codes, SAT catalogs, and `PaymentIntent` metadata. Later (#31): validate the anonymous `publicName: null` mismatch reported by Jesus and align banned-word matching.                                                                                                               |
| **Output obtained**      | [contract.md](contract.md) with two campaign endpoints, the payment session endpoint, field-level validation codes, and the 12-key `PaymentIntent` metadata schema, followed by the browser mock and validator in `web/src/api/validation.ts`.                                                                                                                                                                                              |
| **Verification**         | Both sides implemented against [contract.md](contract.md) independently and reviewed it on issue #31 before connecting the frontend and backend.                                                                                                                                                                                                                                                                                            |
| **Error found**          | While reviewing #31, Jesus found that the web validator generated from the contract accepted `publicName: null` when `isAnonymous` was `true`, whereas the Salesforce validator rejected any request containing the `publicName` key. In addition, the contract did not state whether banned words matched substrings or whole words, leading the backend to use `.contains(word)` (which would reject `Spamalot` and miss accented words). |
| **Corrections applied**  | Updated [contract.md](contract.md) and `web/src/api/validation.ts` (PR #90) so `publicName` is rejected whenever the key is present on an anonymous request (`NOT_ALLOWED`), even if `null`, and specified that banned words match whitespace-delimited tokens ignoring case and accents, with new unit tests in `validation.test.ts`.                                                                                                      |
| **Lesson**               | Written contracts between two AI-assisted codebases must specify nullability vs key omission and exact string-matching semantics; building both sides against the contract surfaces edge cases early.                                                                                                                                                                                                                                       |
| **Estimated time saved** | About 4 hours drafting the contract, SAT catalogs, and shared validation; about 30 minutes spent fixing #31.                                                                                                                                                                                                                                                                                                                                |

---

## 5. React web app, contract mock, and Stripe donation flow (AI error)

| Field                    | Detail                                                                                                                                                                                                                                                                                                                                                                                                           |
|:------------------------ |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Date**                 | 2026-11-06 to 2026-11-10                                                                                                                                                                                                                                                                                                                                                                                         |
| **Author**               | Janssen                                                                                                                                                                                                                                                                                                                                                                                                          |
| **AI tool / model**      | Claude in Claude Code                                                                                                                                                                                                                                                                                                                                                                                            |
| **Requirement**          | RF-D1a, RF-D1b, RF-D1c, RF-D2, RF-D4, RF-C1, RF-F1 (issues #21–#23, #25, #27–#29, #34–#36; PRs #75–#77, #79, #81, #85–#88)                                                                                                                                                                                                                                                                                       |
| **Prompt**               | Build the public web app in `web/`: visual identity (*Rótulo de Mérida* in `PRODUCT.md` and `DESIGN.md`), in-browser mock API from `docs/contract.md`, open and completed campaign lists, custom amount input, two-step donation modal with independent recognition and SAT invoice toggles, Stripe Payment Element in deferred mode, `/gracias` page, and loading states.                                       |
| **Output obtained**      | Complete React + TypeScript application switching between `API_MODE=mock` and `salesforce`, Spanish validation messages, test-card simulation (`4242`, `0002`, `3155`), and Vitest test suites.                                                                                                                                                                                                                  |
| **Verification**         | Ran `oxlint`, TypeScript typecheck, and Vitest suites in CI; reviewed responsive screenshots at 390px and 1440px; tested live on the deployed site.                                                                                                                                                                                                                                                              |
| **Error found**          | 1) After adding the 15-second loading deadline in `useLoad.ts` and `ThankYouPage.tsx` (PR #86), the "No cargó" error screen appeared on its own 15 seconds after a campaign or thank-you page had already finished loading, because the timeout timer was never cleared when the fetch resolved. 2) A generated design-system snippet also used a hard-stop gradient that violated `DESIGN.md`'s Flat Coat Rule. |
| **Corrections applied**  | Cancelled the deadline timer as soon as the response arrives in both `useLoad.ts` and `ThankYouPage.tsx` and added regression tests in `useLoad.test.tsx` and `ThankYouPage.test.tsx` that fail on the unpatched code (PR #88). Replaced the gradient backdrop with a flat `cal` ground before saving.                                                                                                           |
| **Lesson**               | Always pair async timeout timers with cleanup on fulfillment, and verify UI states on the live deployment in addition to unit tests.                                                                                                                                                                                                                                                                             |
| **Estimated time saved** | About 12 hours building the UI, mock API, Stripe flow, and tests; about 45 minutes spent debugging and writing regression tests.                                                                                                                                                                                                                                                                                 |

---

## 6. Docker image, Tailscale Funnel, and CI/CD deployment to the Raspberry Pi (AI error)

| Field                    | Detail                                                                                                                                                                                                                                                                                                                                                    |
|:------------------------ |:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Date**                 | 2026-11-05 to 2026-11-06                                                                                                                                                                                                                                                                                                                                  |
| **Author**               | Janssen                                                                                                                                                                                                                                                                                                                                                   |
| **AI tool / model**      | Claude in Claude Code                                                                                                                                                                                                                                                                                                                                     |
| **Requirement**          | RF-V1, M1, M3 (issue #33; PRs #72, #74, #80)                                                                                                                                                                                                                                                                                                              |
| **Prompt**               | Set up the multi-stage Docker build (Node 22 to Nginx 1.27), runtime `/config.js` injection that refuses non-`pk_test_` keys, CSP headers, and a GitHub Actions workflow that deploys to the team's Raspberry Pi (`dietpi`, `linux/arm64`) over ephemeral Tailscale SSH and publishes HTTPS via Tailscale Funnel.                                         |
| **Output obtained**      | `web/Dockerfile`, `web/docker-compose.yml`, `.github/workflows/web-ci.yml`, and `.github/workflows/web-deploy.yml` using `tailscale/github-action` (`tag:ci` ACL restricted to `tcp:22`) and `docker save` over SSH.                                                                                                                                      |
| **Verification**         | Validated with `actionlint`, local container startup tests (verifying `pk_live_` rejection and CSP headers), and live GitHub Actions deploy runs to `https://dietpi.tail6cb6c6.ts.net:8443/`.                                                                                                                                                             |
| **Error found**          | On the PR #79 merge, the GitHub Actions deploy job hung and crashed inside `docker buildx build` for `linux/arm64` with `qemu: uncaught target signal 4 (Illegal instruction) - core dumped` while running `npm ci` under QEMU ARM emulation. In addition, the remote deploy script initially assumed bash, whereas the Pi user's login shell was `fish`. |
| **Corrections applied**  | Updated `web/Dockerfile` (PR #80) so the Node build stage runs natively on the runner (`FROM --platform=$BUILDPLATFORM node:22-alpine`) since its output is platform-independent static files, leaving only the Nginx stage on `arm64`; added `timeout-minutes: 15` to the build job; piped the remote SSH restart script into `sh -s`.                   |
| **Lesson**               | Never run heavy Node/npm steps under QEMU emulation in multi-arch Docker builds when the build output is static assets; run the build stage on `$BUILDPLATFORM`.                                                                                                                                                                                          |
| **Estimated time saved** | About 4 hours setting up Docker, Nginx CSP, Tailscale ACLs, and CI/CD; about 40 minutes diagnosing the QEMU crash and shell mismatch.                                                                                                                                                                                                                     |

---

## 7. Public Salesforce Site, CORS and guest access (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-10 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-V1; issues #20 and #39; M2 and S11 guardrails |
| **Prompt / summary** | Expose the donation API through a public Salesforce Site, allow the deployed web origin through CORS, and verify access without donor login or guest business-object permissions. |
| **Output obtained** | HealthResource, minimal REST class access, exact CORS origin metadata and documented manual guest credential prerequisites. |
| **Verification** | Anonymous health requests, allowed-origin and denied-origin preflights, guest user-mode denial checks, and the user's confirmation of the deployed-browser CSP configuration; genuine guest PaymentIntent requests later confirmed credential readiness. |
| **Error found** | The generated profile metadata initially assumed that the external-principal and User External Credentials permissions could be represented through unsupported profile entries. |
| **Corrections applied** | Removed those unsupported entries and configured the supported named-principal and credential permissions manually in the Site guest profile, without granting Campaign or Opportunity CRUD. |
| **Lesson** | Verify license-specific Setup permissions in the actual org instead of assuming every permission is deployable through the same profile metadata shape. |
| **Estimated acceleration** | Not measured. The earlier combined API estimate was not allocated to this function; no separate hour saving is claimed. |

---

## 8. Campaign API, progress and date-based availability

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-10 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-D1a, RF-D1c and RF-S1b; issues #21, #23 and #10 |
| **Prompt / summary** | Implement campaign list and detail endpoints with open/completed filtering, date-based availability, recorded donation progress and public supporter data only. |
| **Output obtained** | CampaignsResource, CampaignService and PublicCampaignSelector; inclusive America/Merida date rules, ordering, controlled missing/future-campaign errors, and supporters limited to visible credited names and amounts. |
| **Verification** | DonationBackendTest route and date cases, direct campaign API requests, and later deployed-browser checks showing progress changes only after successful recorded payments. |
| **Error found** | No separate AI implementation error is documented for this function. The initial banned-word defect is recorded under entry 15 rather than attributed to campaign filtering. |
| **Corrections applied** | Kept campaigns open above their goal until their end date and retained successful late-settlement recording as specified by the contract. |
| **Lesson** | Keep campaign availability, payment validation and settlement handling distinct; a fundraising goal is not a closing condition. |
| **Estimated acceleration** | Not measured; no function-specific hour saving is claimed. |

---

## 9. Payment-session validation and sanitized API errors

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-10 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-D3 and RF-D1b; issues #40 and #22; S11 and S14 |
| **Prompt / summary** | Validate payment-session requests against the API contract, reject malformed or invalid input with field-specific errors, and create no donation during session preparation. |
| **Output obtained** | PaymentSessionValidator, PaymentSessionsResource, ApiResponse and ApiException; minimum 50 MXN, centavo precision, request-type/email/required-field checks and campaign availability errors. PaymentSessionService initially used StripeClient with PlaceholderStripeClient for independent development. |
| **Verification** | The initial 12-method DonationBackendTest suite, direct positive/negative API requests and later user-driven minimum-amount, missing-email and missing-display-name checks. |
| **Error found** | No additional error is attributed to these core validation rules. The unsupported real-provider HTTP 502 response and its correction are recorded under entry 17. |
| **Corrections applied** | Retained one contract-compatible error shape and sanitized unexpected failures; placeholder injection remains explicit in tests after activating the HTTP provider. |
| **Lesson** | A valid session request is not a recorded donation, and validation must remain authoritative on the Salesforce side. |
| **Estimated acceleration** | Not measured per function; no new estimate is assigned to the earlier combined API work. |

---

## 10. Name moderation flow with a wrong element name (AI error)

| Field                    | Detail |
|:------------------------ |:------ |
| **Date**                 | 2026-11-16 |
| **Author**               | Esmeralda |
| **AI tool / model**      | Claude Code (Claude Opus 5.5) |
| **Requirement**          | RF-C2 (moderate public names), RF-S4 (rejected payment notices) |
| **Prompt**               | "I want to continue with my part of E2: the rejected payment notices log (RF-S4) and name moderation (RF-C2). Use a flow where it fits, add tests for each acceptance criterion, and check nothing breaks the other team's code before deploying." |
| **Output obtained**      | A "Rejected Notices" list view for admins (RF-S4); for RF-C2, a before-save flow `Public_Name_Banned_Words` that blocks a new or changed display name with a banned word, a "Donor Entries by Campaign" report, and four new Apex tests. The AI wrote the flow as metadata XML instead of building it in Flow Builder. |
| **Verification**         | Validation-only deploy to the shared org before saving anything, then the tests: `StaffConsoleConfigurationTest` and the API team's `DonationBackendTest` together (33/33 pass), to confirm the new flow does not break donation recording. |
| **Error found**          | The first validation failed: "Element getRecords invalid at this location in type Flow". The AI used the Flow Builder label ("Get Records") as the XML element name; in flow metadata that element is called `recordLookups`, and elements must follow a fixed order. |
| **Corrections applied**  | Renamed the element to `recordLookups` and moved it to its place in the file; the validation then passed and the flow was deployed active. |
| **Other finding**        | The story says moderators maintain the banned words, but `Banned_Word__mdt` can only be edited with the "Customize Application" permission, which is far too broad for a moderator. Admins keep the list for now, following least privilege; the team will decide whether to move the list to a custom object. |
| **Lesson**               | Names shown in the Salesforce UI are not always the metadata names. Validate generated metadata with a dry-run deploy before saving it, and run the other team's tests too when adding automation to a shared object. |
| **Estimated time saved** | Building the flow, report and tests by hand would take about 2.5 hours; with the AI, including the fix, it took about 50 minutes. |

---

## 11. Email plan built on the wrong org edition (AI error)

| Field                    | Detail |
|:------------------------ |:------ |
| **Date**                 | 2026-11-17 |
| **Author**               | Janssen |
| **AI tool / model**      | Claude Code (Claude Opus 5.5) |
| **Requirement**          | RF-D5 (receipt email), RF-F3 (invoice email), issue #47 (email limit) |
| **Prompt**               | "What is the best way to set up email sending in Salesforce? Use Salesforce skills and investigate." |
| **Output obtained**      | A design for the receipt and invoice emails: an Apex job queued after the webhook records a new donation, Spanish HTML email templates, an org-wide sender address, no activity saved, and email capacity reserved before sending. |
| **Verification**         | Logged in to the project org with the Salesforce CLI and checked it read-only: `sf org list limits` (`SingleEmail`) and queries on `Organization` and `OrgWideEmailAddress`. |
| **Error found**          | The AI, following the docs, assumed a Developer Edition org with a very low daily email limit. The org is an Enterprise Edition sandbox (`uady--class2026h`) that allows 5,000 single emails a day. The saved CLI login was also for a different class sandbox (`class2026b`). The check also showed no org-wide sender address exists, and that new sandboxes start with deliverability set to "System email only", which blocks donor emails. |
| **Corrections applied**  | Corrected the org edition and the limit in `docs/architecture.md`, `docs/scope.md`, `docs/salesforce-api.md` and `docs/requirements/architecture/solution-architecture.md`. Recorded deliverability and the sender address as open setup items for the org admin. |
| **Lesson**               | Check limits against the real org before planning around them; the docs described the course's default environment, not the org the team actually uses. |
| **Estimated time saved** | Researching the email options and checking the org by hand would take about 1.5 hours; with the AI it took about 25 minutes. |

---

## 12. Receipt addressed to a record the guest cannot read (AI error)

| Field                    | Detail |
|:------------------------ |:------ |
| **Date**                 | 2026-11-17 |
| **Author**               | Janssen |
| **AI tool / model**      | Claude Code (Claude Opus 5.5) |
| **Requirement**          | RF-D5 (receipt email), issue #26 |
| **Prompt**               | "Go ahead" (build the receipt email after the email research), then "Tried the new address and my personal address, mail has not reached." |
| **Output obtained**      | A queued job that builds a Spanish receipt and sends it after each new donation, addressed to the donor Contact with `setTargetObjectId`. |
| **Verification**         | 39 Apex tests passed and the deploy succeeded, then two real test-card payments on the live site. A read-only script in the org showed both donations recorded and both receipt jobs failed with "1 of 1 donation emails failed." A test email from the same org-wide sender, sent as admin, was accepted. |
| **Error found**          | The job runs as the site guest user, which has no Contact access, so naming the Contact as the recipient fails. The tests ran as an admin and could not show it. The job's error message also hid Salesforce's status code, which slowed the diagnosis. Earlier, the first test run had broken four existing webhook tests because they reached the real sender while the org could not send email. |
| **Corrections applied**  | The receipt is now addressed to the donor's email with `setToAddresses`. Job failures name the Salesforce status codes (no donor data). A new test builds the receipt while running as the site guest. The webhook tests use a silent sender. 40/40 tests pass. |
| **Lesson**               | Code that runs for the public site must be tested as the site guest, not only as an admin. Keep platform error codes in failure messages. |
| **Estimated time saved** | Building and diagnosing the email job by hand would take about 3 hours; with the AI, including the fix, about 1 hour. |

---
## 13. Transactional donation recording and backend compatibility (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-10 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-D3; issue #24; S11, S12 and S14 |
| **Prompt / summary** | Record only successful test-mode payments, match or create donor records, create the donation and optional invoice atomically, and make event/payment retries safe. |
| **Output obtained** | DonationRecorder creates a Closed Won Opportunity, primary contact role, optional Invoice_Request__c and Processed Stripe_Event__c; matches Contacts by email, associates company Accounts and rolls back partial writes. The active Donation record type is resolved dynamically. |
| **Verification** | DonationBackendTest covers first recording, repeated event/payment identifiers, rollback, company invoices and late settlement. The initial backend run reported 98 percent test-run coverage; this is a historical run result, not a coverage claim for all later changes. |
| **Error found** | The initial generated backend assumed a cleaner org than the teaching sandbox: existing Donation record-type assignments and a malformed Display_Status__c picklist caused compatibility failures. The AI also generated standalone verification utilities the user did not want retained. |
| **Corrections applied** | Resolved record types through Schema describe, aligned required picklist metadata, and removed standalone acceptance scripts, guides, demo utilities and fixture dependencies from the implementation/manifest. Inherited trigger failures were later handled separately in entries 19 and 20. |
| **Lesson** | Inspect existing record types and automation before deploying to a shared org, and keep temporary verification tooling out of the versioned implementation. |
| **Estimated acceleration** | Previously recorded estimate: about 3.5 hours of drafting assistance and 45 minutes of compatibility work. This is provisional, not measured or a member-confirmed effort total. |

---

## 14. Anonymous donations with independent invoice choice

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-17 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-D2; issue #27; integration with RF-F1 |
| **Prompt / summary** | Ensure anonymous donors supply only the necessary private data, may request an invoice independently, and never appear in the public supporters list. |
| **Output obtained** | Anonymous requests reject the publicName key, including null; donations retain Is_Anonymous__c without a public name, and the public selector excludes them. |
| **Verification** | Backend contract cases and genuine browser donations with and without an individual invoice request. The anonymous invoice donation was Closed Won with one Requested / Simulation / Individual invoice request and a Processed event; progress rose from 300 to 350 MXN without adding a supporter. |
| **Error found** | No new AI error is documented for this function. The earlier frontend acceptance of anonymous publicName:null was identified during the shared contract review and is not claimed as a new backend change. |
| **Corrections applied** | Kept private invoice data separate from recognition; did not infer receipt-email completion from the thank-you message. |
| **Lesson** | Public anonymity must be tested independently from private staff visibility and invoice creation. |
| **Estimated acceleration** | Qualitative estimate only: AI accelerated contract-case selection and record correlation; no measured hour saving is claimed. |

---

## 15. Credited recognition and whole-token banned-word validation (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-16 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-C1; issues #28 and #31; merged PR #99 |
| **Prompt / summary** | Accept credited display names as entered while rejecting configured banned words as whole whitespace-delimited tokens, ignoring case and Latin accents, and exposing only name and amount. |
| **Output obtained** | Updated PaymentSessionValidator and DonationBackendTest; preserved punctuation and submitted display names. Supporter responses remain limited to visible credited donations. |
| **Verification** | Twelve Apex methods, eight public API name cases and targeted PMD Security/Performance checks passed. Browser payments later confirmed credited names and amounts appear without donor emails or fiscal fields. |
| **Error found** | The initial AI-generated substring check rejected valid names such as Spamalot when spam was banned and missed accented variants. This diverged from the agreed whole-token contract. |
| **Corrections applied** | Replaced substring matching with accent-folded, case-insensitive whole-token comparison. Confirmed that spam! remains a different token under the agreed punctuation rule. |
| **Lesson** | Specify and test linguistic boundary cases explicitly; a substring search does not implement whole-word moderation. |
| **Estimated acceleration** | Not measured; no separate quantified acceleration is claimed for this correction. |

---

## 16. Individual and company invoice validation and recording

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-17 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-F1; issue #29; recorder integration with issue #24 |
| **Prompt / summary** | Validate invoice-only fiscal fields, distinguish individual and company RFC lengths, and record a simulated invoice request independently of public recognition. |
| **Output obtained** | Legal name, RFC, taxpayer type, postal code, fiscal regime, fiscal use and invoice-email validation; Invoice_Request__c creation after successful payment, with company Account association when applicable. |
| **Verification** | Backend invoice cases and browser field-error checks confirmed by the user. Genuine individual and company payments produced Requested / Simulation invoice requests with the matching taxpayer type; the company donation linked to its business Account. No CFDI or live SAT call was performed. |
| **Error found** | Two paid invoice attempts initially appeared to indicate an invoice defect. A rollback diagnostic showed that the failure occurred earlier in inherited NPSP/CampaignMember automation, not in fiscal validation; entry 22 documents that correction. |
| **Corrections applied** | Preserved invoice validation and recovered existing paid events after fixing the actual automation dependency. Did not create another payment to recover the records. |
| **Lesson** | Trace the transaction failure before changing fiscal rules; a payment with an invoice can fail in unrelated shared-org automation. |
| **Estimated acceleration** | Qualitative estimate only: AI assisted test-data preparation and record correlation; no measured hour saving is claimed. |

---

## 17. Real Stripe test PaymentIntent creation (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-17 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-D3; issue #45; merged PR #103 |
| **Prompt / summary** | Replace the placeholder default with a real Stripe test provider through Salesforce Named Credentials, using MXN, card-only intents and contract metadata, without creating donations during session creation. |
| **Output obtained** | HttpStripeClient and HttpStripeClientTest, Stripe External Credential / Stripe_API metadata, PaymentSessionService integration and updated deployment/contract documentation. Secrets were entered directly in Salesforce and were not included in source. |
| **Verification** | Sixteen Apex methods passed after activation; guest API requests returned genuine test-mode intents and session creation left donation counts unchanged. Twelve web API tests, TypeScript checks and the web production build passed during provider integration. |
| **Error found** | The AI suggested an unavailable HttpRequest.getTimeout assertion, omitted credential header-formula enablement, and selected HTTP 502 even though Apex REST rejected that response status. Additional test corrections addressed type-name shadowing and fixture access mode. |
| **Corrections applied** | Removed the unsupported assertion, enabled the credential header formula, aligned provider failures to HTTP 503 across contract, Apex, web mock and client tests, and corrected isolated test setup. |
| **Lesson** | Validate platform APIs and supported response codes in the actual Salesforce runtime; contract changes must be synchronized across both clients. |
| **Estimated acceleration** | Qualitative estimate only: AI accelerated provider, metadata and regression drafting; no measured comparison or confirmed hour saving is available. |

---

## 18. Case-insensitive payment-session retry handling (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-17 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-D3; issue #45; merged PR #103 |
| **Prompt / summary** | Reproduce duplicate intents reported during retries and ensure Idempotency-Key is preserved regardless of HTTP header casing. |
| **Output obtained** | Case-insensitive header lookup in PaymentSessionsResource, key validation and HttpStripeClientTest regression cases; the validated key is forwarded to Stripe. |
| **Verification** | Reproduced distinct intents for lowercase headers before the correction. After deployment, canonical, lowercase and uppercase public requests returned the same test intent; invalid retry keys returned 400. Sixteen Apex methods passed and session requests created no donations. |
| **Error found** | The initial AI implementation performed a case-sensitive request-header lookup and silently discarded a lowercase retry header. |
| **Corrections applied** | Compared request header names without case sensitivity and added canonical/lowercase/uppercase regression coverage. |
| **Lesson** | HTTP header names are case-insensitive even when the application's map lookup is not. This backend support does not by itself implement browser-side retry-key generation. |
| **Estimated acceleration** | Qualitative estimate only: AI assisted reproduction and regression drafting; no measured hour saving is claimed. |

---

## 19. Public Stripe webhook activation and secret configuration

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-17 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-V3a; issues #11 and #46; merged PR #104 |
| **Prompt / summary** | Expose the Stripe snapshot webhook through the Salesforce Site, configure the signing-secret boundary safely and verify genuine provider reachability. |
| **Output obtained** | StripeWebhookResource, StripeWebhookService, Stripe_Settings__c schema, guest REST class access and the portable webhook manifest. The user configured the organization-level secret directly in Setup and authorized the official CLI for the existing sandbox. |
| **Verification** | The unconfigured public handler returned sanitized 503. After manual configuration, unsigned requests returned 400; genuine signed failed/successful Stripe sandbox events reached Salesforce. No business-object guest permission was added. |
| **Error found** | A CLI login completion response differed from the initial automated assumption; the supported interactive login flow was completed by the user. This was a tooling limitation, not a failed payment. |
| **Corrections applied** | Used the user's interactive sandbox authorization and verified configuration through safe responses instead of retrieving or printing credentials. |
| **Lesson** | Endpoint reachability, presence of configuration and matching provider signatures are distinct checks; a 400 for an unsigned request proves only the authentication boundary. |
| **Estimated acceleration** | Qualitative estimate only: AI assisted metadata, activation guidance and safe checks; no measured hour saving is claimed. |

---

## 20. Authentic, repeat-safe notices and safe rejection evidence (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-17 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-V3b; issue #12; RF-V3a rejection integration for issue #11 |
| **Prompt / summary** | Verify signatures before parsing or trusting event identifiers, ignore repeated events/payments, and log rejected notices without exposing or retaining sensitive payload data. |
| **Output obtained** | StripeSignatureVerifier and eight StripeWebhookTest methods; exact UTF-8 HMAC-SHA256 verification, 300-second skew tolerance, multiple v1 signatures, test-mode checks, deduplication and fixed rejection reasons with server-generated references. Staff list views and roles remain another contributor's work. |
| **Verification** | Independent Node-generated HMAC vector, boundary/stale/tampered/live/malformed cases, case-insensitive headers, guest-context tests and real event resends. Rejected/failed notices created no donations; duplicate paid deliveries retained one donation and invoice request per payment. |
| **Error found** | The initial AI suggestion used an unavailable Crypto.areEqualConstantTime call and treated custom-setting describe access as equivalent to business-object CRUD. A test expression also required explicit subtraction spacing. |
| **Corrections applied** | Used supported Crypto.verifyHMac, checked Opportunity permissions and the sanitized public response boundary, and corrected the test expressions. Unsigned payload IDs are never used as genuine event deduplication keys. |
| **Lesson** | Use supported cryptographic APIs and test the actual authorization boundary; unauthenticated identifiers must not reserve trusted uniqueness keys. |
| **Estimated acceleration** | Qualitative estimate only: AI accelerated negative-case and cryptographic regression drafting; no measured hour saving is claimed. |

---

## 21. Legacy Opportunity automation compatibility (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-17 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-D3 and RF-V3a; issues #24 and #11; shared-org risk R9 |
| **Prompt / summary** | Diagnose successful Stripe payments that cannot be recorded and, with org-admin authorization, prevent an absent optional legacy fund from aborting donations. |
| **Output obtained** | Retrieved OpportunityTrigger with a missing-fund guard and LegacyOpportunityTriggerTest; retained legacy insert/update/delete calculations when FONDOS SDU exists and explicit system operations without guest permission expansion. |
| **Verification** | Rollback diagnostics traced the recording failure to the inherited trigger. Twenty-eight selected Apex methods passed, including four legacy regressions with 200-record cases; targeted PMD checks found no violations. Replaying the existing paid event recorded one anonymous 50 MXN donation and another replay left totals unchanged. |
| **Error found** | The missing FONDOS SDU query was inherited platform automation, not code generated for this portal. A new regression assertion initially omitted WITH SYSTEM_MODE on a legacy field and required correction. |
| **Corrections applied** | Guarded the missing record, corrected the assertion access context and preserved existing calculations. No legacy fund was created and the trigger was not disabled. |
| **Lesson** | A valid payment can fail because of inherited automation. Preserve atomic rollback and recover by replaying the verified event rather than taking another payment; fund ownership remains a documented cross-team risk. |
| **Estimated acceleration** | Qualitative estimate only: AI assisted stack analysis and bulk regression drafting; no measured hour saving is claimed. |

---

## 22. Returning-donor CampaignMember compatibility and payment recovery (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-17 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-D3 and RF-F1; issues #24 and #29; RF-V3a integration |
| **Prompt / summary** | Find why returning-donor invoice payments remain unrecorded, protect unrelated NPSP updates from scholarship automation, and recover the already-paid events safely. |
| **Output obtained** | Retrieved CampaignMemberTriggerHandler with an early return for unchanged approval and a missing-fund guard; LegacyCampaignMemberTriggerTest covers unrelated 200-member updates, approval/reversal calculations and returning-donor invoice recording plus replay. |
| **Verification** | Rollback diagnostics traced NPSP Opportunity processing to PreApproveStudent. Thirty-two selected Apex methods passed; the final explicit sharing declaration was redeployed with all four member regressions passing, and targeted PMD checks reported zero violations. Replayed two paid 50 MXN events, yielding two donations and invoice requests; another replay retained the same counts and both events reached zero pending webhooks. |
| **Error found** | The initial diagnosis associated the symptom with invoicing, but the exception occurred before invoice insertion. An admin-context Named Credential diagnostic was unavailable, and the retrieved handler needed an explicit sharing declaration to pass analysis. |
| **Corrections applied** | Used fictitious diagnostic data with runtime donor lookup under rollback, corrected the inherited handler without changing invoice rules, preserved its system-context calculation and replayed genuine signed events. |
| **Lesson** | Reproduce the returning-donor path, including package-managed updates to related records; do not equate payment success with completed Salesforce persistence. |
| **Estimated acceleration** | Qualitative estimate only: AI assisted transaction tracing and regressions; no measured hour saving is claimed. |

---

## 23. Deployed donor acceptance checks across web, Stripe and Salesforce (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-17 |
| **Author** | Jesus Estrella |
| **AI tool / model** | Codex in VS Code; the exact model identifier is not independently recorded for this consolidated entry. |
| **Requirement** | RF-D3, RF-D2, RF-C1 and RF-F1; shared issue #44 and issues #24, #27, #28, #29 |
| **Prompt / summary** | Guide the user through donor-browser tests and correlate each result with Stripe events, Salesforce records and public campaign progress, without adding testing scripts to the repository. |
| **Output obtained** | Verified credited, anonymous, declined, individual-invoice and company-invoice submissions. Recorded donations retained payment references; anonymous donations remained private, and company donations linked to a business Account. Public progress reached 400 MXN with four credited names and amounts. |
| **Verification** | User-submitted test cards, screenshots, safe CLI/event queries, Processed webhook logs, Closed Won donation records, Requested / Simulation invoice requests and the public campaign API. The user confirmed required-field, minimum-amount, RFC and postal-code failures; event replay safety was checked separately. |
| **Error found** | The thank-you page promised a receipt although Salesforce email delivery was unfinished. The AI also initially described email implementation as the user's next task before checking repository assignees. |
| **Corrections applied** | Clarified that payment/recording tests do not prove email delivery; confirmed #26, #30 and #47 belong to hjanssena. Another contributor subsequently adjusted thank-you wording; no ownership of that UI change is claimed here. Abandoned-payment and email checks remain part of the team's final integration work. |
| **Lesson** | Distinguish UI messages, provider status and persisted backend evidence, and verify task ownership before proposing the next implementation. |
| **Estimated acceleration** | Qualitative estimate only: AI assisted guided checks and cross-system correlation; no measured hour saving is claimed. |

---
