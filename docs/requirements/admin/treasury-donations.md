# Admin Domain — Donation Management

This document covers how staff view donations, find invoice requests, record donations received outside the website, and moderate the names shown publicly.

---

## RF-S2 · View All Donations
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Staff
- **User Story:** As a staff member, I want to see all donations with their key details, so that I can track fundraising.

### Acceptance Criteria
- **CA1 (Donation Overview):** **Given** donations exist in all three modalities, **when** I view the donations list, **then** I see each donation's amount, modality, campaign, donor email, and payment reference.
- **CA2 (Donation Source):** **Given** some donations were recorded from website payments and others were entered by staff, **when** I view the donations list, **then** I can tell which is which.
- **CA3 (Negative: Staff Only):** **Given** I am not an authenticated staff member, **when** I try to open the donations list, **then** access is denied and no donation data is shown.

---

## RF-F2 · Flag and Filter Invoice Requests
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Staff
- **User Story:** As a staff member, I want donations that requested an invoice to be flagged, so that I can find them and check the invoice was sent.

### Acceptance Criteria
- **CA1 (Invoice Flag and Tax Details):** **Given** a donation requested an invoice, **when** I view it, **then** it is flagged "Requests Invoice" and shows the donor's name and RFC.
- **CA2 (Filtering):** **Given** donations of several modalities exist, **when** I filter for invoice requests, **then** I see only those donations.
- **CA3 (Negative: No Flag):** **Given** a donation did not request an invoice, **when** I view it, **then** it carries no "Requests Invoice" flag.

---

## RF-S3 · Manually Record a Donation
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Staff (Donation Entry)
- **User Story:** As a staff member who records donations, I want to enter a donation received outside the website, so that the campaign's progress includes it.
- **Open points:** Whether a donation can be recorded for a completed campaign, and whether a credited donation entered this way appears on the supporters list.

### Acceptance Criteria
- **CA1 (Record a Donation):** **Given** I am an authenticated staff member, **when** I enter a donation with its campaign, amount, and modality, **then** it is saved and the campaign's progress includes the amount.
- **CA2 (Negative: Invalid Amount):** **Given** I am entering a donation, **when** I enter an amount of zero or less, or a non-numeric value, **then** it is not saved and I see a validation error.
- **CA3 (No Email):** **Given** I recorded a donation, **when** it is saved, **then** no email is sent to anyone.
- **CA4 (Negative: Staff Only):** **Given** I am not an authenticated staff member, **when** I try to enter a donation, **then** it is not possible.

---

## RF-C2 · Moderate Public Names
- **Milestone:** Deliverable 2 (E2)
- **Actor:** Staff (Moderator)
- **User Story:** As a staff member who moderates, I want to hide or correct names on the supporters list and block banned words, so that inappropriate names do not stay visible.
- **Open point:** Who maintains the list of banned words.

### Acceptance Criteria
- **CA1 (Hide a Name):** **Given** a name on the supporters list is inappropriate, **when** I hide it, **then** it no longer appears on the public list.
- **CA2 (Correct a Name):** **Given** a name on the supporters list needs fixing, **when** I change it, **then** the public list shows the new name.
- **CA3 (Hidden Donation Still Counts):** **Given** I hid a name, **when** I check the campaign's progress, **then** the donation's amount is still included.
- **CA4 (Negative: Banned Word):** **Given** a donor enters a name containing a banned word, **when** they submit the form, **then** submission is blocked and they are asked to enter another name.
- **CA5 (Negative: Staff Only):** **Given** I am not an authenticated staff member, **when** I try to hide or change a name, **then** it is not possible.
