# AI Logbook (Bitácora de IA)

Formal record of how the team used AI tools, evaluated under criterion **C3** in E1 and E2. Each entry keeps the nine fields required in [ai-and-documentation-logging.md](workflow/ai-and-documentation-logging.md). Entries marked **AI error** count toward the minimum of three documented cases where the AI was wrong and the team caught and fixed it.

All three team members add their own entries. Never paste secrets, tokens or real personal data into a prompt or into this log.

## Summary

| # | Date | Author | RF | AI error |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 2026-11-07 | Esmeralda | RF-S5, RF-F2 | Yes: data model contradicted the agreed architecture |
| 2 | 2026-11-10 | Esmeralda | RF-C1, RF-C2 | Yes: picklist values copied as a single broken value |

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
