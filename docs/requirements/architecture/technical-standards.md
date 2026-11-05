# Architecture — Technical Standards, Constraints & AI Governance

This document captures the non-functional development standards (`C6`), platform constraints, failure contingencies, and AI documentation rules defined in [lineamientos.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/lineamientos.md).

---

## 1. Development Best Practices (`C6`)

- **Exception Handling (`S11`):**
  - Display clear, user-friendly error screens/messages to visitors when something fails.
  - Prevent orphaned or inconsistent records in Salesforce if a transaction or callout fails.
- **Governor Limits & Bulkification (`S12`):**
  - All Apex classes and Flows must be free of SOQL queries or DML statements inside loops.
  - Triggers, Flows, and batchable logic must support bulk record operations.
- **Code Quality & Unit Testing (`S14`):**
  - Clean execution using **Salesforce Code Analyzer**.
  - Unit tests must pass and assert business logic without relying on hard-coded Salesforce Record IDs (`SeeAllData=false`).
- **Gateway Currency Configuration:**
  - Use `MXN` (Mexican Peso) in Stripe Test Mode. The minimum donation is 50 MXN with no maximum. If test constraints require `USD`, document a technical note justifying the choice.

---

## 2. Technical Constraints

- **Environment:** 1 Salesforce Developer Edition org per team (no paid add-ons).
- **Payment Gateway:** Stripe in **Test Mode only**. Activating live accounts or linking real bank accounts is strictly prohibited.
- **Budget:** Zero cost ($0). Any AppExchange package or external third-party service requires prior approval from the professor.
- **Allowed Tech Stack:** VS Code, Salesforce CLI (`sf`), Developer Console, Flow Builder, Salesforce Code Analyzer, GitHub, and free-tier AI tools.
- **Org Expiration Prevention:**
  - At least one team member must log into the Salesforce Developer Edition org weekly.
  - Regular metadata backups must be committed to Git using Salesforce CLI (`sf project retrieve start`).

---

## 3. Platform Failure Contingency Matrix

If a Salesforce Developer Edition limitation blocks a requirement, report it to the professor to activate the contingency plan:

| Detected Situation | Advisor / Professor Contingency Action |
| :--- | :--- |
| Developer Edition does not allow enabling public sites (Experience Cloud / Salesforce Sites). | Provision of a technical alternative or adjustment to `RF-V1`, `RF-V2`, and `M2`. |
| The public API cannot be called by the Guest User (Apex class access or CORS for the team's web origin is blocked). | Authorization of an equivalent alternative mechanism for `RF-D1a`, `RF-D3` and `M2`. |
| Platform blocks incoming external webhooks to the Developer Edition org. | Contingency plan for `RF-D5` and `RF-V3a` preserving autonomous status updates. |
| Outbound email fails or hits the Developer Edition daily limit. Salesforce sends the receipt (`RF-D5`) and the invoice (`RF-F3`) because Stripe sends no receipt in test mode. | Acceptance of system logs or alternative verifiable evidence of the generated receipt. |

---

## 4. AI Usage Guidelines & Required Deliverables

### Mandatory Rules
1. **Mandatory Comprehension:** Incorporating code or configurations that the team cannot explain or defend is prohibited.
2. **Confidentiality:** Never paste tokens, API secrets, credentials, or sensitive personal data into LLM prompts.
3. **Real-Time Logging:** Continuously log AI interactions in `docs/bitacora_ia.md`.

### Required Documentation Files

| Document | Path | Minimum Contents |
| :--- | :--- | :--- |
| **AI Logbook** | `docs/bitacora_ia.md` | Date, author, AI tool, associated RF, prompt/summary, output obtained, verification method, corrections applied, and acceleration estimate. Must include **at least 3 documented AI errors/hallucinations** that were caught and fixed (for `C3` Excellence). |
| **AI Context File** | Root or `docs/` (`CLAUDE.md`, etc.) | Master system prompts or architectural context provided to LLMs. |
| **Individual Contributions** | GitHub Project | Tracked in the team's GitHub Project, linked to the squashed PRs and commits on `main`. There is no `docs/contribucion.md`. |
