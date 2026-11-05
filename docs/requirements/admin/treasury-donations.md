# Admin Domain — Donation Management

This document covers how the team views donations, finds invoice requests, records donations received outside the website, and moderates the names shown publicly. Who may do what is defined in [roles.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/admin/roles.md).

---

## RF-S2 · View All Donations
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Team Member (Admin, Campaign Manager, or Moderator)
- **User Story:** As a team member, I want to see all donations with their key details, including those from anonymous donors, so that I can track fundraising and answer donor questions.

### Acceptance Criteria
- **CA1 (Donation Overview):** **Given** donations exist, **when** I view the donations list, **then** I see each donation's amount, campaign, donor email, whether it is anonymous or credited, whether an invoice was requested, and its payment reference.
- **CA2 (Anonymous Donors Visible):** **Given** a donor chose to be anonymous, **when** I view the donations list, **then** I see their email and the donation is marked `Anonymous`.
- **CA3 (Donation Source):** **Given** some donations were recorded from website payments and others were entered by an admin, **when** I view the donations list, **then** I can tell which is which.
- **CA4 (Negative: No Role):** **Given** I am not signed in or have no team role, **when** I try to open the donations list, **then** access is denied and no donation data is shown.

---

## RF-F2 · Flag and Filter Invoice Requests
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Admin or Campaign Manager
- **User Story:** As an admin or campaign manager, I want donations that requested an invoice to be flagged, so that I can find them and check the invoice was sent.

### Acceptance Criteria
- **CA1 (Invoice Flag and Tax Details):** **Given** a donation requested an invoice, **when** I view it, **then** it is flagged "Requests Invoice" and shows the donor's legal name and RFC.
- **CA2 (Filtering):** **Given** donations with and without invoice requests exist, **when** I filter for invoice requests, **then** I see only those donations.
- **CA3 (Negative: No Flag):** **Given** a donation did not request an invoice, **when** I view it, **then** it carries no "Requests Invoice" flag.
- **CA4 (Negative: Moderator Cannot See RFC):** **Given** I am signed in as a moderator, **when** I view a donation that requested an invoice, **then** I see the flag but not the invoice data or the RFC.

---

## RF-S3 · Manually Record a Donation
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Admin
- **User Story:** As an admin, I want to enter a donation received outside the website, so that the campaign's progress includes it.
- **Open points:** Whether a donation can be recorded for a completed campaign, and whether a credited donation entered this way appears on the supporters list.

### Acceptance Criteria
- **CA1 (Record a Donation):** **Given** I am a signed-in admin, **when** I enter a donation with its campaign, amount, and whether the donor is anonymous or credited (with a name), **then** it is saved and the campaign's progress includes the amount.
- **CA2 (Negative: Invalid Amount):** **Given** I am entering a donation, **when** I enter an amount below 50 MXN, or a non-numeric value, **then** it is not saved and I see a validation error that states the minimum.
- **CA3 (No Email):** **Given** I recorded a donation, **when** it is saved, **then** no email is sent to anyone.
- **CA4 (Negative: Admin Only):** **Given** I am signed in as a campaign manager or a moderator, **when** I try to enter a donation, **then** it is not possible.

---

## RF-C2 · Moderate Public Names
- **Milestone:** Deliverable 2 (E2)
- **Actor:** Moderator
- **User Story:** As a moderator, I want to review the donor entries of a campaign and hide or correct inappropriate display names, so that they do not stay visible on the supporters list.
- **Open point:** Who maintains the list of banned words.

### Acceptance Criteria
- **CA1 (Review Entries):** **Given** a campaign has donations, **when** I open its entries, **then** I see each donor's display name and email, including anonymous donors.
- **CA2 (Hide a Name):** **Given** a display name on the supporters list is inappropriate, **when** I hide it, **then** it no longer appears on the public list.
- **CA3 (Correct a Name):** **Given** a display name on the supporters list needs fixing, **when** I change it, **then** the public list shows the new name.
- **CA4 (Hidden Donation Still Counts):** **Given** I hid a name, **when** I check the campaign's progress, **then** the donation's amount is still included.
- **CA5 (Negative: Banned Word):** **Given** a donor enters a name containing a banned word, **when** they submit the form, **then** submission is blocked and they are asked to enter another name.
- **CA6 (Negative: Emails Are Read-Only):** **Given** I am signed in as a moderator, **when** I try to change a donor's email, **then** it is not possible.
- **CA7 (Negative: Campaign Manager):** **Given** I am signed in as a campaign manager, **when** I try to hide or change a name, **then** it is not possible.
- **CA8 (Negative: No Role):** **Given** I am not signed in or have no team role, **when** I try to hide or change a name, **then** it is not possible.
