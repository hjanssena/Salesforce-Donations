# Software Requirements Specification — Mexico Dreamin Donation Portal

**Program:** SF Vibe Lab (UADY × Salesforce, Mérida)  
**Deliverable 1 (E1):** Tuesday, November 10, 2026  
**Deliverable 2 (E2):** Tuesday, November 17, 2026  
**Oral Defense (E5):** Wednesday, November 18, 2026  

> [!IMPORTANT]
> **Simulation Disclaimer:** This project is strictly an academic exercise. All funds are simulated, the payment gateway (Stripe) operates exclusively in Test Mode, all personal and tax data are fictitious, and no real CFDI tax receipts are issued.

---

## 1. Directory Structure & Domain Organization

The requirements are organized by domain (Donor/Public Side, Admin/Internal Side, and Cross-Cutting Architecture & Security):

- **Donor Domain (`donor/`)**
  - [general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) — Public site access, campaign browsing, donation pre-registration, checkout redirection, thank-you page, and automated receipts (`RF-V1`, `RF-D1a`, `RF-D1b`, `RF-D3`, `RF-D4`, `RF-D5`).
  - [modalities.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/modalities.md) — Rules and acceptance criteria for Anonymous (`RF-D2`), Credited (`RF-C1`), and Invoiced/RFC (`RF-F1`) donations.
- **Admin / Staff Domain (`admin/`)**
  - [campaign-management.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/campaign-management.md) — Creating and managing fundraising campaigns and targets (`RF-S1`).
  - [treasury-donations.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/treasury-donations.md) — Backoffice donation visibility, invoice request filtering, and manual payment confirmation (`RF-S2`, `RF-S3`, `RF-F2`).
  - [payment-webhooks.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/payment-webhooks.md) — Automated Stripe webhook handling, cryptographic verification, idempotency, and audit visibility (`RF-S4`, `RF-V3a`, `RF-V3b`).
- **Architecture & Non-Functional (`architecture/`)**
  - [security-privacy.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/architecture/security-privacy.md) — Pass/Fail mandatory minimums (`M1–M3`), Guest User security proof (`RF-V2`), least privilege (`S15`), and PII classification (`OA6`).
  - [technical-standards.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/architecture/technical-standards.md) — Development best practices (`S11`, `S12`, `S14`), platform constraints, contingency matrix, and AI usage guidelines.

---

## 2. Requirements Traceability Matrix

| ID | Title | Domain File | Actor | Milestone |
| :--- | :--- | :--- | :--- | :--- |
| **RF-V1** | Scoped Public Site (No Login) | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Visitor | E1 |
| **RF-D1a** | Select Campaign & View Progress | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Donor | E1 |
| **RF-D1b** | Donate Custom Amount | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Donor | E2 |
| **RF-D2** | Donate Anonymously | [donor/modalities.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/modalities.md) | Anonymous Donor | E1 |
| **RF-D3** | Donation Recorded After Successful Payment | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Donor | E1 |
| **RF-D4** | Thank-You Page | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Donor | E1 |
| **RF-D5** | Automatic Confirmation & Receipt | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Donor | E2 |
| **RF-C1** | Public Donor Recognition | [donor/modalities.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/modalities.md) | Credited Donor | E1 |
| **RF-F1** | Capture Tax Data (RFC) | [donor/modalities.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/modalities.md) | Invoiced Donor | E1 |
| **RF-F2** | Flag Invoice Requests | [admin/treasury-donations.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/treasury-donations.md) | Staff | E1 |
| **RF-S1** | Manage Campaigns | [admin/campaign-management.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/campaign-management.md) | Staff (Coordination) | E1 |
| **RF-S2** | View All Donations | [admin/treasury-donations.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/treasury-donations.md) | Staff (Treasury) | E1 |
| **RF-S3** | Confirm Payment Manually | [admin/treasury-donations.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/treasury-donations.md) | Staff (Treasury) | E1 |
| **RF-S4** | View Auto-Confirmations & Rejected Webhooks | [admin/payment-webhooks.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/payment-webhooks.md) | Staff (Treasury) | E2 |
| **RF-V2** | Visitor Security Proof | [architecture/security-privacy.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/architecture/security-privacy.md) | Staff / Auditor | E1 |
| **RF-V3a** | Receive Payment Webhook (Minimum) | [admin/payment-webhooks.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/payment-webhooks.md) | System / Treasury | E2 |
| **RF-V3b** | Authentic & Idempotent Webhooks (Level 2) | [admin/payment-webhooks.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/payment-webhooks.md) | System / Treasury | E2 (Optional) |

---

## 3. Scope Boundaries

### In Scope
- Public site without login displaying active campaigns, goal progress, and a donation form.
- Three donor modalities: **Anonymous**, **Credited** (publicly recognized name), and **Invoiced** (name and RFC).
- Recording of each donation in Salesforce as `Paid` once Stripe Test authorizes the payment, followed by redirection to a Thank-You page.
- Internal Salesforce console for staff to manage campaigns, track donations, manually confirm payments, and trigger email receipts.
- Automated payment confirmation via Stripe webhooks (E2).
- Security testing documentation (`docs/seguridad.md`) and personal data classification.

### Out of Scope
- Real payments, live payment gateway activation, or real money handling.
- Official tax receipt generation (CFDI) or live SAT validation.
- Legal terms of service, formal privacy notices, or regulatory compliance frameworks.
- Donor login/authentication or direct allocation of funds to individual students.
- Bank reconciliation against Stripe statements or student-level metrics/dashboards.
- Real personal data (PII).
- Anti-spam protection (must be documented as a residual risk in `docs/seguridad.md`, but is not graded).

---

## 4. Open Discovery Questions & Backlog Schema

### Suggested Discovery Questions for the Client
1. **Invoiced Donor Visibility:** Can a donor requesting an invoice (`RF-F1`) choose whether or not their name appears on the public donor recognition list (`RF-C1`), or does requesting an invoice imply a default visibility?
2. **Abandoned Pending Donations:** What lifecycle or expiration policy applies to `Pending` donations (`RF-D3`) that are never completed in Stripe?
3. **Receipt Content (`RF-D5` / `RF-S3`):** What exact fields must be included in the email receipt sent to donors across each of the three modalities?
4. **Mexico Dreamin Ticket Price:** What is the benchmark ticket/travel cost per student to establish realistic campaign goals?

### Required Backlog Entry Schema
Every user story tracked in the project backlog must contain:
- `ID`
- `Associated RF`
- `Milestone (E1 / E2)`
- `User Story (As a... I want... So that...)`
- `Acceptance Criteria (Given / When / Then — including negative cases)`
- `Status (Met / Not Met)`
- `Evidence (Link to test / screenshot / video)`
