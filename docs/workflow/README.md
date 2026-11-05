# Development Workflow & Git Governance

This directory documents the engineering workflow, version control conventions, pull request strategy, and release management for the **Mexico Dreamin Donation Portal** project.

---

## Workflow Documentation Index

- **[commits-and-linting.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/workflow/commits-and-linting.md)** — Conventional Commits standard, automated Husky + Commitlint verification, and pre-commit secret guardrails (`M3`).
- **[branching-and-merge-strategy.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/workflow/branching-and-merge-strategy.md)** — Feature branching model, Pull Request (PR) rules, mandatory peer review, and **Squash and Merge** to `main`.
- **[releases-and-tagging.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/workflow/releases-and-tagging.md)** — Semantic Versioning (`vX.Y.Z`) and milestone deliverable tags (`entrega-1`, `entrega-2`).
- **[project-board.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/workflow/project-board.md)** — The GitHub Project: statuses, sprints, blocked tickets, and the automation that unblocks them.
- **[ai-and-documentation-logging.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/workflow/ai-and-documentation-logging.md)** — Mandatory AI change logging (`AI/log.md`), deliverable AI audit trail (`docs/bitacora_ia.md`), and where contributions are tracked (the team's GitHub Project).

---

## End-to-End Developer Lifecycle

```mermaid
flowchart LR
    A["Create Feature Branch\n(feat/RF-D1a-campaign-list)"] --> B["Develop & Log\n(Update AI/log.md)"]
    B --> C["Commit Changes\n(Husky + Commitlint)"]
    C --> D["Open Pull Request\n(Target: main)"]
    D --> E["Peer Code Review\n(>= 1 Approval)"]
    E --> F["Squash & Merge\n(Clean commit on main)"]
    F --> G["Release Tagging\n(v1.0.0 / entrega-1)"]
```
