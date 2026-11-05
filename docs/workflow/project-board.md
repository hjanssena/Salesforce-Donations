# Project Board, Dependencies and Statuses

The team tracks work in the GitHub Project **Mexico Dreamin Donation Portal** (project 6 of `hjanssena`). Individual contributions are read from it, so keep it current.

## Statuses

| Status | Meaning |
| :--- | :--- |
| **Blocked** | Waiting on another ticket that is still open. |
| **Todo** | Ready to start. |
| **In Progress** | Someone is working on it. |
| **Done** | Closed. |

Tickets are also grouped by **Sprint** (Sprint 1 is E1, Sprint 2 is E2) and carry a delivery milestone and the labels `user-story` or `chore`, `web` or `salesforce`, and `E1` or `E2`.

## Dependencies

A ticket that cannot start until another is done uses GitHub's own relationship: open the ticket, then **Relationships → Blocked by**, and pick the blocking ticket. Set its Status to **Blocked** while a blocker is open.

Only block tickets whose work is entirely on one side. A story ticket that holds both web and Salesforce tasks has no blocker links, so the other side can start. Instead, each side's task list starts with a line saying what it waits for (for example _Can start after #34._). Check that line before picking up a side.

## Automation

The workflow `.github/workflows/update-blocked-tickets.yml` runs when an issue is closed or reopened:
- **Closed:** each ticket it blocks moves from Blocked to Todo, unless another open ticket still blocks it.
- **Reopened:** each ticket it blocks that is in Todo moves back to Blocked.

It can also be run by hand from the Actions tab with an issue number and `dry_run` set to `true`, which prints what would change.

### One-time setup
GitHub's built-in token cannot edit a user-owned project, so the workflow needs a personal access token:
1. Create a token (classic) with the `project` and `repo` scopes, as the project owner.
2. In the repository, go to **Settings → Secrets and variables → Actions** and add it as the secret `PROJECT_TOKEN`.

Never commit the token. If the repository or project moves to an organization, change `PROJECT_NUMBER` and the `user(login:)` query in the workflow to `organization(login:)`.
