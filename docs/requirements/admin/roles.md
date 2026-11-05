# Admin Domain — Team Roles and Access

The team that runs the program uses three roles. All three can see donor data, including donors who chose to be anonymous. Everything else is split by role.

| Role | Purpose |
| :--- | :--- |
| **Admin** | Runs the whole program: manual donations, invoice requests, rejected payment notices, banned words, and role assignment. |
| **Campaign Manager** | Creates and configures campaigns. |
| **Moderator** | Moderates the entries of a campaign: donors' names and emails. |

## Access Matrix

| Capability | Admin | Campaign Manager | Moderator | Story |
| :--- | :---: | :---: | :---: | :--- |
| View donations and donor data, anonymous donors included | Yes | Yes | Yes | `RF-S2` |
| Create and configure campaigns | Yes | Yes | No | `RF-S1` |
| Hide or correct public names | Yes | No | Yes | `RF-C2` |
| Maintain banned words | Yes | No | Yes (to confirm) | `RF-C2` |
| See RFC and invoice details | Yes | No | No | `RF-F2` |
| Manually record donations | Yes | No | No | `RF-S3` |
| View rejected payment notices | Yes | No | No | `RF-S4` |
| Assign roles to team members | Yes | No | No | `RF-S5` |

Two cells are assumptions the stakeholder has not confirmed: RFC visible to admins only, and banned words maintained by moderators and admins.

---

## RF-S5 · Role-Based Team Access
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Admin
- **User Story:** As an admin, I want each team member to have only the access their role needs, so that donor data and campaign settings are protected.

### Acceptance Criteria
- **CA1 (Assign a Role):** **Given** I am a signed-in admin, **when** I give a team member a role, **then** they get that role's access the next time they sign in.
- **CA2 (Admin Access):** **Given** I am signed in as an admin, **when** I use the team pages, **then** I can do everything in the access matrix.
- **CA3 (Campaign Manager Access):** **Given** I am signed in as a campaign manager, **when** I use the team pages, **then** I can create and configure campaigns and view donations, and I cannot hide names, record donations, see RFCs, or open the rejected notices log.
- **CA4 (Moderator Access):** **Given** I am signed in as a moderator, **when** I use the team pages, **then** I can view donations and hide or correct names, and I cannot create campaigns, record donations, see RFCs, or open the rejected notices log.
- **CA5 (Anonymous Donors Visible to All Roles):** **Given** a donor chose to be anonymous, **when** an admin, a campaign manager, or a moderator views the donation, **then** each sees the donor's email.
- **CA6 (Negative: No Role):** **Given** a team member has no role, **when** they sign in, **then** they see no donation, campaign, or notice data.
- **CA7 (Negative: Roles Admin Only):** **Given** I am signed in as a campaign manager or a moderator, **when** I try to assign a role, **then** it is not possible.
