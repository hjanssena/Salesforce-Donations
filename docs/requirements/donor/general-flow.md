# Donor Domain — General Donation Flow

This document covers the base public experience and end-to-end donation lifecycle applicable to **all three donor modalities** (Anonymous, Credited, and Invoiced).

> **Refinement Rule:** The base flow (`RF-D1` through `RF-D5`) must operate on a unified foundation across all donor types without requiring visitor authentication.

---

## RF-V1 · Scoped Public Site (No Login)
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Public Visitor (Unauthenticated Guest User)
- **User Story:** As a visitor, I want to access the site without creating an account, so that I can donate without friction.

### Acceptance Criteria
- **CA1 (Public Access):** **Given** I do not have an active session, **when** I open the site URL, **then** I see the active campaigns without being prompted to log in.
- **CA2 (Strict Scope):** **Given** I browse the site as an unauthenticated visitor, **when** I navigate through all accessible pages, **then** I only see campaigns, progress toward goals, public recognition of credited donors (name and amount only), and the donation form.

---

## RF-D1a · Select Campaign and View Progress
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Donor (Any Modality)
- **User Story:** As a donor, I want to select a campaign and see how much progress it has made toward its goal, so that I can decide which campaign to support.

### Acceptance Criteria
- **CA1 (Campaign List & Progress):** **Given** there are at least two active campaigns with defined goals, **when** I enter the public site without logging in, **then** I see each campaign displaying its target goal and current progress.
- **CA2 (Paid-Only Progress Calculation):** **Given** a donation for a campaign transitions to `Paid` status, **when** I reload the public site, **then** the campaign's progress includes that donation's amount. Donations in `Pending` status do not count toward the progress.
- **CA3 (Amount Selection):** **Given** I have selected a campaign, **when** I proceed to donate, **then** I can specify the donation amount either by choosing from a list of suggested amounts or by entering it in the payment gateway.

---

## RF-D1b · Donate Any Custom Amount
- **Milestone:** Deliverable 2 (E2)
- **Actor:** Donor (Any Modality)
- **User Story:** As a donor, I want to donate any amount I choose, so that I can contribute what I can afford rather than being limited to suggested presets.

### Acceptance Criteria
- **CA1 (Custom Amount Match):** **Given** I have selected a campaign, **when** I enter a custom amount greater than zero on the site, **then** the test payment gateway charges me that exact amount and the donation record in Salesforce registers that exact same amount.
- **CA2 (Negative Case — Invalid Amount):** **Given** I have selected a campaign, **when** I attempt to enter an amount less than or equal to zero (or non-numeric), **then** the form prevents submission and displays a clear validation message.

---

## RF-D3 · Donation Recorded After Successful Payment
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Donor (Any Modality)
- **User Story:** As a donor, I want my donation to be recorded once my payment succeeds, so that the program's records reflect only money that was actually received.

### Acceptance Criteria
- **CA1 (Record After Successful Payment):** **Given** I have filled in my details and selected a campaign, **when** the payment gateway authorizes my payment, **then** a donation record exists in Salesforce in `Paid` status with its campaign, modality, and the amount paid.
- **CA2 (Payment Reference Correlation):** **Given** a donation record was created from a successful payment, **when** staff views it, **then** it shows the unique payment reference that allows locating the corresponding Stripe test payment.
- **CA3 (Negative Case — Unsuccessful Payment):** **Given** I started a payment, **when** it is declined, cancelled, or left unfinished, **then** no donation record is created in Salesforce and the campaign's progress does not change.

---

## RF-D4 · Thank-You Page
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Donor (Any Modality)
- **User Story:** As a donor, I want to see a thank-you page upon completing my payment, so that I know my donation submission was received.

### Acceptance Criteria
- **CA1 (Post-Payment Redirect):** **Given** I completed the payment using a test card, **when** the payment gateway redirects me back to the site, **then** I see a thank-you page.
- **CA2 (Unconfirmed Payment Wording):** **Given** the payment has not yet been confirmed in Salesforce at the moment of redirect, **when** I view the thank-you page, **then** the page does *not* claim that my payment is already confirmed.
- **CA3 (Data Isolation on Thank-You Page):** **Given** I am on the thank-you page, **when** I inspect it, **then** it does not display data belonging to any other donors.

---

## RF-D5 · Automatic Confirmation and Receipt
- **Milestone:** Deliverable 2 (E2)
- **Actor:** Donor (Any Modality)
- **User Story:** As a donor, I want my donation to be confirmed automatically and to receive my receipt without manual staff review, so that I have proof of my contribution as soon as I pay.

### Acceptance Criteria
- **CA1 (Zero-Touch Status Update):** **Given** I paid with a test card, **when** the payment gateway confirms the payment via webhook, **then** the donation record transitions to `Paid` in Salesforce without any staff member modifying it manually.
- **CA2 (Automated Email Receipt):** **Given** the donation transitioned to `Paid` automatically, **when** I check the email address I provided, **then** I receive a receipt that allows me to identify my donation (exact receipt fields to be defined by the team in the user story).
