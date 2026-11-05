# Admin Domain — Payment Notices and Automation

This document covers the Deliverable 2 (E2) requirements for recording payments automatically from the payment provider's notices (webhooks), accepting only authentic notices, avoiding duplicates, and showing staff which notices were rejected.

---

## RF-V3a · Receive Payment Webhook (Minimum Level)
- **Milestone:** Deliverable 2 (E2, mandatory)
- **Actor:** Admin
- **User Story:** As an admin, I want each successful payment to be recorded automatically, so that donations and campaign progress stay current without manual entry.

### Acceptance Criteria
- **CA1 (Automatic Recording):** **Given** a donor paid with a test card, **when** the payment provider confirms the payment, **then** the donation is recorded as `Paid` without anyone entering it.
- **CA2 (Negative: Unsuccessful Payment):** **Given** the payment provider reports a declined or cancelled payment, **when** the notice arrives, **then** no donation is recorded.
- **CA3 (Negative: Malformed Notice):** **Given** a notice arrives with missing or unreadable data, **when** it is processed, **then** no donation is recorded and the notice is logged for staff (`RF-S4`).

---

## RF-V3b · Authentic and Idempotent Notices (Second Level)
- **Milestone:** Deliverable 2 (E2, optional)
- **Actor:** Admin
- **User Story:** As an admin, I want only authentic payment notices to be accepted and repeated notices to be ignored, so that no donation is added without a payment and none is counted twice.

### Acceptance Criteria
- **CA1 (Negative: Forged Notice):** **Given** someone other than the payment provider sends a forged or unsigned notice, **when** it arrives, **then** it is rejected, no donation is recorded, and the rejection is visible to staff (`RF-S4`).
- **CA2 (Duplicate Notice):** **Given** the payment provider sends the same notice twice, **when** both arrive, **then** only one donation is recorded and the campaign total is not counted twice.

---

## RF-S4 · View Rejected Payment Notices
- **Milestone:** Deliverable 2 (E2)
- **Actor:** Admin
- **User Story:** As an admin, I want to see which payment notices were rejected and why, so that I can trust the donation data without checking every payment.

### Acceptance Criteria
- **CA1 (Rejected Notice Log):** **Given** a notice was rejected (for example an invalid signature or a malformed payload), **when** I open the rejected notices log, **then** I see when it arrived and why it was rejected.
- **CA2 (Negative: No Donation From Rejected Notices):** **Given** a notice was rejected, **when** I view the donations list, **then** no donation exists for it.
- **CA3 (Negative: Admin Only):** **Given** I am signed in as a campaign manager or a moderator, or not signed in, **when** I try to open the rejected notices log, **then** access is denied.
