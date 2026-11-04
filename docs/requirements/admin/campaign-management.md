# Admin Domain — Campaign Management

This document covers the internal requirements for program coordination staff to configure and maintain fundraising campaigns in Salesforce.

---

## RF-S1 · Manage Campaigns
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Staff (Program Coordination)
- **User Story:** As program coordination staff, I want to create and manage campaigns with their financial goals and active periods, so that I can organize the fundraising efforts for Mexico Dreamin.

### Acceptance Criteria
- **CA1 (Campaign Creation & Publication):** **Given** I am an authenticated staff member in Salesforce, **when** I create a campaign with a name, a target goal amount, and a start and end date, **then** the campaign is active and appears on the public donation portal while the current date falls within that time span, and it does not accept donations outside it.
- **CA2 (Goal Locked Once Active):** **Given** a campaign has started, **when** a staff member attempts to change its target goal amount, **then** the change is rejected and the goal remains as it was, whether or not donations have been received.
- **CA3 (Goal Editable Before Start):** **Given** a campaign has not started yet, **when** a staff member updates its target goal amount, **then** the new goal is saved and the public site shows it once the campaign is active.
- **CA4 (Negative Case — Invalid Goal Amount):** **Given** I am creating or editing a campaign, **when** I attempt to set a target goal less than or equal to zero, **then** the system prevents saving the record and displays a validation error.
