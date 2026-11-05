# Architecture — Security, Privacy & Pass/Fail Minimums

This document outlines the mandatory security requirements, Guest User isolation rules, personal data classification (`OA6`), and the required structure for `docs/seguridad.md`.

---

## 1. Mandatory Pass/Fail Minimums (`M1–M3`)

> [!CAUTION]
> **Grading Penalty:** Each unsatisfied minimum in **Deliverable 2 (E2)** deducts **10 net points** from the team's final grade. In Deliverable 1 (E1), formative feedback is provided without point deduction.

| ID | Minimum Requirement | Verification Rule | Evaluation Method |
| :--- | :--- | :--- | :--- |
| **M1** | **Test Mode & Fictitious Data** | Operations strictly restricted to Stripe Test Mode, test cards, and dummy data. Real accounts or real PII are strictly prohibited. | Live demo verification and org configuration audit. |
| **M2** | **Unauthenticated Visitor Isolation** | Configured with strict *least privilege*. The public Guest User cannot read or modify records belonging to other donors. | Reproducible execution of `RF-V2` by the evaluator. |
| **M3** | **Zero Exposed Secrets** | No API keys (Stripe Secret Key / Webhook Signing Secret) present in source code, metadata, public repositories, Git history, screenshots, or logs. | Inspection of Git commits, branches, metadata, and site bundles. |

### Credential Leak Protocol
If an API key or secret is accidentally committed to Git:
1. Rotate/revoke the key in Stripe on the **same day**.
2. Purge the secret from the repository.
3. Report the incident immediately to the professor to mitigate the grading penalty under the Communication objective (`OA1`).

---

## 2. RF-V2 · Visitor Security Proof
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Program Coordinator / Security Auditor
- **User Story:** As a program coordinator, I want evidence that a visitor cannot read or change other people's donations, so that donors' privacy and the program's financial records are protected.

### Acceptance Criteria
- **CA1 (Read Isolation):** **Given** donations from other people exist, **when** an unauthenticated visitor tries to read them through the public site or any other route the team identified (for example URL changes or REST, Aura, or GraphQL calls), **then** the visitor gets no data from those donations.
- **CA2 (Write Isolation):** **Given** donations from other people exist, **when** an unauthenticated visitor tries to change or overwrite them, **then** the attempt fails.
- **CA3 (Negative: No Direct Donation Creation):** **Given** I am an unauthenticated visitor, **when** I try to create a donation without a successful payment, **then** the attempt fails.
- **CA4 (Reproducible Documentation):** **Given** the security documentation (`docs/seguridad.md`), **when** another person follows its steps, **then** they can repeat the test and get the same result.

---

## 3. Platform Security & Data Privacy (`S15` & `OA6`)

### Principle of Least Privilege (`S15`)
- **Guest User Profile & Sharing:** The Guest User gets no object permissions on `Donation` (Opportunity) or its related records. It may only call the public API, which returns campaigns and approved public donor recognition summaries (name and amount) and starts a payment session. Organization-Wide Defaults (OWD) for external users must default to `Private` where applicable.
- **Integration User / Webhook Context:** Integration accounts or webhook handlers must have permissions restricted solely to receiving the webhook, logging the event, and creating the donation after a verified successful payment.
- **Web Application Origin:** The donor-facing web app runs outside Salesforce on a team-owned server over HTTPS. The org allows only that origin through CORS.

### Personal Data Classification (`OA6`)
- Systematically classify all collected fields:
  - **Donor Name** (PII — Public if `Credited` or `Invoiced`, not collected if `Anonymous`).
  - **Email Address** (PII — Strictly confidential; used solely for receipt delivery, never displayed publicly).
  - **RFC** (Sensitive Tax ID — Strictly internal for `Invoiced` modality; validated via regex, never public). It travels in the PaymentIntent metadata until the donation is recorded, so only fictitious RFCs are allowed.
  - **Payment Tokens / References** (Operational — Store only Stripe Checkout Session / PaymentIntent IDs; never capture or store raw card numbers/CVV in Salesforce).
- **Email Testing Rule:** Only email addresses owned and controlled by the project team may be used during testing to prevent sending emails to real third parties.

---

## 4. Required Structure of `docs/seguridad.md`
To satisfy Deliverable 1 and Deliverable 2 (`C5`), `docs/seguridad.md` must contain:
1. **Reproducible Guest User Test Procedure:** Step-by-step read and write/modification attempt verification (`RF-V2`).
2. **Privilege Justification:** Exact list and justification of object/field/Apex permissions granted to the Guest User.
3. **Secret Protection Validation:** How Stripe keys are stored securely (e.g., Named Credentials, Custom Metadata/Protected Custom Settings not tracked in Git) and verified absent from Git history (`M3`).
4. **Personal Data Classification Matrix:** Field-by-field breakdown and justification of what is stored vs. discarded (`OA6`).
5. **Residual Risk Analysis:** Documented analysis of unmitigated risks, explicitly including public form spam/DoS.
6. **Webhook Security Protocol (Added in E2):** Documentation of webhook authentication (`RF-V3b`) and deduplication logic.
