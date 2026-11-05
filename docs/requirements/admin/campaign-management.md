# Admin Domain — Campaign Management

This document covers how staff set up campaigns and how campaigns open and close.

---

## RF-S1 · Manage Campaigns
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Staff
- **User Story:** As a staff member, I want to create campaigns with their content, goal, and dates, so that donors can see what they can support and when.

### Acceptance Criteria
- **CA1 (Campaign Creation and Publication):** **Given** I am an authenticated staff member, **when** I create a campaign with a name, description, images, purpose, goal amount, start date, and end date, **then** it appears on the public site while the current date falls between its start and end dates.
- **CA2 (Negative: Required Content):** **Given** I am creating a campaign, **when** I leave out any of those fields, **then** the campaign is not saved and I see which field is missing.
- **CA3 (Negative: Invalid Goal):** **Given** I am creating or editing a campaign, **when** I set a goal of zero or less, **then** the campaign is not saved and I see a validation error.
- **CA4 (Goal Editable Before Start):** **Given** a campaign has not started, **when** I change its goal, **then** the new goal is saved and the public site shows it once the campaign opens.
- **CA5 (Negative: Goal Locked After Start):** **Given** a campaign has started, **when** I try to change its goal, **then** the change is rejected and the goal stays as it was, whether or not donations have come in.

---

## RF-S1b · Close Campaigns Automatically
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Staff
- **User Story:** As a staff member, I want campaigns to stop receiving donations when they end or reach their goal, so that no donor gives to a closed campaign and I do not have to close it by hand.

### Acceptance Criteria
- **CA1 (End Date):** **Given** a campaign's end date has passed, **when** a donor opens the site, **then** the campaign is not offered for donations.
- **CA2 (Goal Reached):** **Given** the recorded donations of a campaign reach 100% of its goal, **when** a donor opens the site, **then** the campaign is not offered for donations and is shown as completed.
- **CA3 (Negative: Not Yet Started):** **Given** a campaign's start date is in the future, **when** a donor opens the site, **then** the campaign is not offered for donations.
- **CA4 (Simultaneous Payments):** **Given** two payments for the same campaign succeed close together and their total goes past 100% of the goal, **when** both complete, **then** both donations are recorded and the progress shows the full total.
