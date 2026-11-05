# Admin Domain — Campaign Management

This document covers how campaign managers set up campaigns and how campaigns open and close.

---

## RF-S1 · Manage Campaigns
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Campaign Manager
- **User Story:** As a campaign manager, I want to create and configure campaigns with their content, goal, and dates, so that donors can see what they can support and when.

### Acceptance Criteria
- **CA1 (Campaign Creation and Publication):** **Given** I am a signed-in campaign manager, **when** I create a campaign with a name, description, purpose (what the money is for), image, goal amount, start date, and end date, **then** it appears on the public site, with its description and purpose, while the current date falls between its start and end dates.
- **CA2 (Negative: Required Content):** **Given** I am creating a campaign, **when** I leave out any of those fields, including the image, **then** the campaign is not saved and I see which field is missing.
- **CA3 (Negative: Invalid Goal):** **Given** I am creating or editing a campaign, **when** I set a goal of zero or less, **then** the campaign is not saved and I see a validation error.
- **CA4 (Goal Editable Before Start):** **Given** a campaign has not started, **when** I change its goal, **then** the new goal is saved and the public site shows it once the campaign opens.
- **CA5 (Negative: Goal Locked After Start):** **Given** a campaign has started, **when** I try to change its goal, **then** the change is rejected and the goal stays as it was, whether or not donations have come in.
- **CA6 (Negative: Other Roles):** **Given** I am signed in as a moderator, **when** I try to create or edit a campaign, **then** it is not possible.

---

## RF-S1b · Close Campaigns on Their End Date
- **Milestone:** Deliverable 2 (E2)
- **Actor:** Campaign Manager
- **User Story:** As a campaign manager, I want campaigns to stop receiving donations on their end date, so that no donor gives to a closed campaign and I do not have to close it by hand.

### Acceptance Criteria
- **CA1 (End Date):** **Given** a campaign's end date has passed, **when** a donor opens the site, **then** the campaign is not offered for donations and is shown as completed.
- **CA2 (Goal Reached Keeps Campaign Open):** **Given** the recorded donations of a campaign pass 100% of its goal and its end date has not passed, **when** a donor opens the site, **then** the campaign is still offered for donations and its progress shows the real percentage, for example 120%.
- **CA3 (Negative: Not Yet Started):** **Given** a campaign's start date is in the future, **when** a donor opens the site, **then** the campaign is not offered for donations.
