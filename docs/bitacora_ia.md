# AI Logbook (Bitácora de IA)

Formal record of how the team used AI tools, evaluated under criterion **C3** in E1 and E2. Each entry keeps the nine fields required in [ai-and-documentation-logging.md](workflow/ai-and-documentation-logging.md). Entries marked **AI error** count toward the minimum of three documented cases where the AI was wrong and the team caught and fixed it.

All three team members add their own entries. Never paste secrets, tokens or real personal data into a prompt or into this log.

## Summary

| # | Date | Author | RF | AI error |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 2026-11-07 | Esmeralda | RF-S5, RF-F2 | Yes: data model contradicted the agreed architecture |
| 2 | 2026-11-10 | Esmeralda | RF-C1, RF-C2 | Yes: picklist values copied as a single broken value |
| 3 | 2026-11-10 | Esmeralda | RF-S3, RF-S5, RF-S1 | Yes: setup guide missed record types; found by automated tests |

---

## 1. Data model guide that contradicted the agreed architecture (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-07 |
| **Author** | Esmeralda |
| **AI tool / model** | Claude Code (Claude Opus 5.5) |
| **Requirement** | RF-S5, RF-F2 (data model for part B) |
| **Prompt** | "Give me the steps for my part B." Then, one step at a time, "Done" to ask for the next object or field to create in Setup. |
| **Output obtained** | A click-by-click guide to build the data model. It told me to create `Modality__c` (Anonymous / Credited / Invoiced) and a `Donor__c` lookup on Opportunity, `Source__c` with the values Stripe / Manual, and an invoice object without the SAT fields. |
| **Verification** | Before uploading the metadata, I asked the AI what the team's repo was missing. It re-read the repo and compared the org against [architecture.md](architecture.md) and [solution-architecture.md](requirements/architecture/solution-architecture.md). |
| **Error found** | The guide came from an older version of the plan. The agreed model uses an `Is_Anonymous__c` checkbox because anonymity and invoicing are independent choices; a single `Modality__c` picklist could not hold a donor who is anonymous and also asks for an invoice. The donor is linked through the Opportunity contact role, not a lookup. `Source__c` is Website / Manual. `Invoice_Request__c` also needs postal code, tax regime, CFDI use, invoice type and a Failed status, and `Stripe_Event__c` needs a lookup to Opportunity. |
| **Corrections applied** | In the org: deleted `Modality__c` and `Donor__c`; created `Is_Anonymous__c`; renamed the Stripe value to Website; added the four SAT fields, the Failed status and the `Stripe_Event__c.Opportunity__c` lookup. The draft `data-model.md` the AI wrote was not uploaded, because it duplicated and contradicted the architecture docs. |
| **Lesson** | Check the guide against the repo's architecture docs before building, not after. |
| **Estimated time saved** | About 2 hours of reading Salesforce documentation; about 30 minutes were spent on the corrections. |

---

## 2. Display Status saved as one broken picklist value (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-10 |
| **Author** | Esmeralda |
| **AI tool / model** | Claude Code (Claude Opus 5.5) |
| **Requirement** | RF-C1 (public donor wall), RF-C2 (moderate public names) |
| **Prompt** | "Done", after finishing Campaign, to ask for the next step: the Opportunity fields. The AI answered with a table that listed each picklist's values. |
| **Output obtained** | A table where the picklist values were separated by an HTML line break, shown as `Visible<br>Hidden`. I copied the cell into the picklist values box. |
| **Verification** | While preparing manual donations (RF-S3), I opened a new Donation form and sent a screenshot. The AI then read the field definition from the org. |
| **Error found** | `Display_Status__c` had a single value, `Visible<br>Hidden`, instead of two values, Visible and Hidden. The supporters list and the API (contract.md) filter on exactly `Visible`, so no donation could ever be hidden or shown correctly. All other picklists (Source, Invoice Status, Taxpayer Type, Stripe Event Status) were checked and were correct. |
| **Corrections applied** | Edited the value to `Visible` (label and API name) and added a new value `Hidden`; Visible stays the default. The metadata in the repo was retrieved again with the fix. |
| **Lesson** | When the AI gives picklist values, check that each one is on its own line before saving, and open the field afterwards to confirm the list of values. |
| **Estimated time saved** | The step-by-step guide saved about 1 hour; the fix took about 10 minutes. |

---

## 3. Setup guide missed record types, found by automated tests (AI error)

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-10 |
| **Author** | Esmeralda |
| **AI tool / model** | Claude Code (Claude Opus 5.5) |
| **Requirement** | RF-S3 (manual donations), RF-S5 (roles), RF-S1 (campaigns) |
| **Prompt** | "I want to finish all the tests." |
| **Output obtained** | An Apex test class, `StaffConsoleConfigurationTest`, with 18 tests that create test users inside the test (no licenses used, nothing kept in the shared org), give them each role, and try the acceptance criteria with user-mode DML and describe calls. Run as a validation-only deploy. |
| **Verification** | The first run failed 9 of 18 tests. Each failure was traced to its cause in the org. |
| **Error found** | The AI's earlier setup guide never covered record types. Campaign and Opportunity have record types in this org (NPSP and other teams), so: (1) the value **Manual** of `Source__c` was not enabled on the Donation record type, and nobody could have recorded a manual donation; (2) the three permission sets gave no record type access, so a user with only the Admin or Campaign Manager role could not create campaigns or donations. A third failure was the test's fault: Salesforce's own end-date check fires before the team rule. |
| **Corrections applied** | By hand in Setup: enabled Manual (and Visible / Hidden, default Visible) on the Donation record type; gave Donations Admin the Campaign Default and Opportunity Donation record types, and Campaign Manager the Campaign Default record type. The test now accepts either end-date message. The AI's attempt to deploy the record type change itself was blocked, because that record type is shared with other teams, so the change was made by hand. |
| **Other finding** | Another team's `OpportunityTrigger` runs on every Opportunity insert and adds the amount to their campaign "FONDOS SDU". Tests create that campaign to run; in the real org, this team's donations would also be added to that other team's fund. Raised with the team and recorded as residual risk R9 in `docs/seguridad.md`. |
| **Lesson** | Configuration that looks complete when checked as a System Administrator can still fail for a user with only the role. Test each role as that role. |
| **Estimated time saved** | Writing 18 tests by hand would take about 3 hours; the run and fixes took about 40 minutes. |

