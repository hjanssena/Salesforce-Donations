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
  - [general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) — Public site access, campaign browsing, completed campaigns, donation recording after payment, thank-you page, and payment receipt (`RF-V1`, `RF-D1a`, `RF-D1b`, `RF-D1c`, `RF-D3`, `RF-D4`, `RF-D5`).
  - [modalities.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/modalities.md) — Rules and acceptance criteria for Anonymous (`RF-D2`), Credited (`RF-C1`), and Invoiced (`RF-F1`, `RF-F3`) donations.
- **Admin / Staff Domain (`admin/`)**
  - [campaign-management.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/campaign-management.md) — Creating campaigns and closing them automatically (`RF-S1`, `RF-S1b`).
  - [treasury-donations.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/treasury-donations.md) — Donation visibility, invoice request filtering, manual donation entry, and public name moderation (`RF-S2`, `RF-F2`, `RF-S3`, `RF-C2`).
  - [payment-webhooks.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/payment-webhooks.md) — Automatic recording of payments from provider notices, authenticity checks, duplicate handling, and the rejected notices log (`RF-V3a`, `RF-V3b`, `RF-S4`).
- **Architecture & Non-Functional (`architecture/`)**
  - [security-privacy.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/architecture/security-privacy.md) — Pass/Fail mandatory minimums (`M1–M3`), Guest User security proof (`RF-V2`), least privilege (`S15`), and PII classification (`OA6`).
  - [solution-architecture.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/architecture/solution-architecture.md) — Services (React web app, Salesforce, Stripe), payment flow, and the data model mapped to standard Salesforce objects.
  - [technical-standards.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/architecture/technical-standards.md) — Development best practices (`S11`, `S12`, `S14`), platform constraints, contingency matrix, and AI usage guidelines.

---

## 2. Requirements Traceability Matrix

| ID | Title | Domain File | Actor | Milestone |
| :--- | :--- | :--- | :--- | :--- |
| **RF-V1** | Scoped Public Site (No Login) | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Visitor | E1 |
| **RF-D1a** | Select Campaign & View Progress | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Donor | E1 |
| **RF-D1b** | Donate Custom Amount | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Donor | E2 |
| **RF-D1c** | Browse Completed Campaigns & No-Open-Campaign Message | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Visitor | E2 |
| **RF-D2** | Donate Anonymously | [donor/modalities.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/modalities.md) | Anonymous Donor | E1 |
| **RF-D3** | Donation Recorded After Successful Payment | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Donor | E1 |
| **RF-D4** | Thank-You Page | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Donor | E1 |
| **RF-D5** | Payment Receipt by Email | [donor/general-flow.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/general-flow.md) | Donor | E2 |
| **RF-C1** | Public Donor Recognition | [donor/modalities.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/modalities.md) | Credited Donor | E1 |
| **RF-C2** | Moderate Public Names | [admin/treasury-donations.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/treasury-donations.md) | Staff (Moderator) | E2 |
| **RF-F1** | Capture Tax Data (RFC) | [donor/modalities.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/modalities.md) | Invoiced Donor | E1 |
| **RF-F2** | Flag Invoice Requests | [admin/treasury-donations.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/treasury-donations.md) | Staff | E1 |
| **RF-F3** | Receive Invoice by Email | [donor/modalities.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/donor/modalities.md) | Invoiced Donor | E2 |
| **RF-S1** | Manage Campaigns | [admin/campaign-management.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/campaign-management.md) | Staff | E1 |
| **RF-S1b** | Close Campaigns Automatically | [admin/campaign-management.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/campaign-management.md) | Staff | E1 |
| **RF-S2** | View All Donations | [admin/treasury-donations.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/treasury-donations.md) | Staff | E1 |
| **RF-S3** | Manually Record a Donation | [admin/treasury-donations.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/treasury-donations.md) | Staff (Donation Entry) | E1 |
| **RF-S4** | View Rejected Payment Notices | [admin/payment-webhooks.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/payment-webhooks.md) | Staff | E2 |
| **RF-V2** | Visitor Security Proof | [architecture/security-privacy.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/architecture/security-privacy.md) | Program Coordinator / Auditor | E1 |
| **RF-V3a** | Receive Payment Webhook (Minimum) | [admin/payment-webhooks.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/payment-webhooks.md) | Staff | E2 |
| **RF-V3b** | Authentic & Idempotent Webhooks (Level 2) | [admin/payment-webhooks.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/payment-webhooks.md) | Staff | E2 (Optional) |

---

## 3. Scope Boundaries

### In Scope
- Public site in English, without login, displaying open and completed campaigns, goal progress, and a donation form.
- Three donor modalities: **Anonymous**, **Credited** (publicly recognized name), and **Invoiced** (name and RFC).
- Recording of each donation in Salesforce as `Paid` once Stripe Test authorizes the payment, followed by a Thank-You page and a receipt email sent by Salesforce.
- Internal Salesforce console for staff to manage campaigns, view donations, enter donations received outside the website, and moderate public names.
- Invoice emails for tax-deduction requests (no CFDI).
- Automatic recording of payments from Stripe webhooks (E2).
- Security testing documentation (`docs/seguridad.md`) and personal data classification.

### Out of Scope
- Real payments, live payment gateway activation, or real money handling.
- Official tax receipt generation (CFDI) or live SAT validation.
- Legal terms of service, formal privacy notices, or regulatory compliance frameworks.
- Donor login/authentication or direct allocation of funds to individual students.
- Bank reconciliation against Stripe statements or student-level metrics/dashboards.
- Real personal data (PII).
- Refunds and mistaken-payment handling.
- Donations received outside the website, other than manual entry by staff (`RF-S3`).
- Languages other than English.
- Anti-spam protection (must be documented as a residual risk in `docs/seguridad.md`, but is not graded).

---

## 4. Open Discovery Questions & Backlog Schema

### Stakeholder Questions
The questions put to the stakeholder and their answers are logged in [stakeholder-questions.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/stakeholder-questions.md).

### Required Backlog Entry Schema
Every user story tracked in the project backlog must contain:
- `ID`
- `Associated RF`
- `Milestone (E1 / E2)`
- `User Story (As a... I want... So that...)`
- `Acceptance Criteria (Given / When / Then — including negative cases)`
- `Status (Met / Not Met)`
- `Evidence (Link to test / screenshot / video)`
