# Donor Domain — General Donation Flow

This document covers the public experience and the donation lifecycle shared by **all three donor modalities** (Anonymous, Credited, and Invoiced). The site is in English only.

> **Refinement Rule:** The base flow (`RF-D1` through `RF-D5`) must work the same way for every donor type, without requiring visitor authentication.

---

## RF-V1 · Scoped Public Site (No Login)
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Visitor (Unauthenticated Guest User)
- **User Story:** As a visitor, I want to use the site without creating an account, so that I can donate without friction.

### Acceptance Criteria
- **CA1 (Public Access):** **Given** I have no active session, **when** I open the site URL, **then** I see the open campaigns without being asked to log in.
- **CA2 (Strict Scope):** **Given** I browse as an unauthenticated visitor, **when** I go through every accessible page, **then** I only see campaigns (open and completed), their progress, the supporters list (name and amount only), the donation form, and the thank-you page.
- **CA3 (Negative: Staff Pages):** **Given** I have no active session, **when** I try to open a staff page by its address, **then** I am asked to log in and I see no staff data.

---

## RF-D1a · Select Campaign and View Progress
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Donor (Any Modality)
- **User Story:** As a donor, I want to pick a campaign and see how much it has raised toward its goal, so that I can decide which one to support.
- **Open point:** The team proposes the suggested amounts.

### Acceptance Criteria
- **CA1 (Campaign List):** **Given** two or more campaigns are open, **when** I enter the site, **then** I see each one with its name, description, images, purpose, deadline, goal, and progress.
- **CA2 (Single Campaign):** **Given** only one campaign is open, **when** I enter the site, **then** I land directly on that campaign instead of a list.
- **CA3 (Progress From Recorded Donations):** **Given** a donation is recorded for a campaign, **when** I reload the site, **then** the campaign's progress includes that donation's amount.
- **CA4 (Negative: Unfinished Payments):** **Given** a payment was declined, cancelled, or left unfinished, **when** I reload the site, **then** the campaign's progress has not changed.
- **CA5 (Amount Selection):** **Given** I have selected a campaign, **when** I proceed to donate, **then** I can choose from a list of suggested amounts or enter the amount during payment.

---

## RF-D1b · Donate Any Custom Amount
- **Milestone:** Deliverable 2 (E2)
- **Actor:** Donor (Any Modality)
- **User Story:** As a donor, I want to donate any amount I choose, so that I can give what I can afford instead of being limited to suggested amounts.
- **Open point:** The minimum is the lowest amount the payment provider allows. The team confirms it from the provider's documentation.

### Acceptance Criteria
- **CA1 (Custom Amount Match):** **Given** I have selected a campaign, **when** I enter an amount at or above the minimum and pay, **then** I am charged exactly that amount and the donation records the same amount.
- **CA2 (Negative: Invalid Amount):** **Given** I have selected a campaign, **when** I enter an amount of zero or less, or a non-numeric value, **then** the form blocks submission and shows a message that explains why.
- **CA3 (Negative: Below Minimum):** **Given** I have selected a campaign, **when** I enter an amount below the minimum, **then** the form blocks submission and shows the minimum allowed amount.

---

## RF-D1c · Browse Completed Campaigns and See When None Is Open
- **Milestone:** Deliverable 2 (E2)
- **Actor:** Visitor (Unauthenticated Guest User)
- **User Story:** As a visitor, I want to browse past campaigns and be told when no campaign is receiving donations, so that I can see what past campaigns raised and never land on an empty page.

### Acceptance Criteria
- **CA1 (Completed Campaigns View):** **Given** campaigns have ended or reached their goal, **when** I open the completed campaigns view, **then** I see each of them with its goal and the amount raised.
- **CA2 (No Open Campaigns Message):** **Given** every campaign has ended or reached its goal, **when** I open the site, **then** I see a message that no campaign is receiving donations right now, and I can browse the completed campaigns.
- **CA3 (Negative: No Donating to Completed Campaigns):** **Given** a campaign has ended or reached its goal, **when** I open it from the completed campaigns view, **then** no option to donate is offered.

---

## RF-D3 · Donation Recorded After Successful Payment
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Donor (Any Modality)
- **User Story:** As a donor, I want my donation to be recorded once my payment succeeds, so that the program's records reflect only money it actually received.

### Acceptance Criteria
- **CA1 (Record After Successful Payment):** **Given** I have filled in my details and selected a campaign, **when** the payment is authorized, **then** a donation record exists in `Paid` status with its campaign, modality, my details for that modality, and the amount paid.
- **CA2 (Payment Reference):** **Given** a donation was recorded from a successful payment, **when** staff view it, **then** it shows the unique payment reference that locates the matching Stripe test payment.
- **CA3 (Negative: Unsuccessful Payment):** **Given** I started a payment, **when** it is declined, cancelled, or left unfinished, **then** no donation record is created and the campaign's progress does not change.

---

## RF-D4 · Thank-You Page
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Donor (Any Modality)
- **User Story:** As a donor, I want to see a thank-you page after I pay, so that I know my donation was received.

### Acceptance Criteria
- **CA1 (Post-Payment Redirect):** **Given** I completed the payment with a test card, **when** I am returned to the site, **then** I see a thank-you page.
- **CA2 (Unconfirmed Payment Wording):** **Given** my donation is not recorded yet when I return to the site, **when** I view the thank-you page, **then** it does not claim that my donation is confirmed.
- **CA3 (Data Isolation):** **Given** I am on the thank-you page, **when** I inspect it, **then** it shows no data from any other donor.
- **CA4 (Negative: No Payment Made):** **Given** I open the thank-you page without having paid, **when** I view it, **then** it does not claim that a donation was made.

---

## RF-D5 · Payment Receipt by Email
- **Milestone:** Deliverable 2 (E2)
- **Actor:** Donor (Any Modality)
- **User Story:** As a donor, I want to receive a receipt by email as soon as I pay, so that I have proof of my donation.

### Acceptance Criteria
- **CA1 (Receipt After Payment):** **Given** I paid with a test card, **when** my donation is recorded, **then** I receive an email from the program at the address I gave, with the donation reference, campaign, amount and date, and my name unless I donated anonymously.
- **CA2 (Negative: Unsuccessful Payment):** **Given** my payment was declined, cancelled, or left unfinished, **when** I check my email, **then** I have received no receipt.
- **CA3 (Single Email):** **Given** I did not request an invoice, **when** my payment succeeds, **then** the receipt is the only email I receive.
