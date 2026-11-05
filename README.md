# Mexico Dreamin Donation Portal

**Program:** SF Vibe Lab (UADY × Salesforce, Mérida)  
**Deliverable 1 (E1):** November 10, 2026 · **Deliverable 2 (E2):** November 17, 2026  

> [!IMPORTANT]
> **Academic Simulation Disclaimer:** This project is an academic exercise. All donations are simulated, Stripe operates exclusively in **Test Mode**, all donor and tax data are fictitious, and no real CFDI tax receipts are generated.

---

## Overview

The **Mexico Dreamin Donation Portal** is a Salesforce-backed fundraising platform designed to help SF Vibe Lab students cover ticket, travel, and lodging expenses to attend **Mexico Dreamin 2026** in Mexico City.

### Key Capabilities
- **Public Donation Portal (No Login Required):** Visitors can browse active fundraising campaigns, view real-time progress toward financial goals, and see publicly recognized donors (`RF-V1`, `RF-D1a`, `RF-D1b`).
- **Three Donation Modalities:**
  - **Anonymous (`RF-D2`):** Donor identity is completely hidden from all public views and email receipts.
  - **Credited (`RF-C1`):** Donor's name and contribution amount appear on the campaign's public donor wall once paid.
  - **Invoiced (`RF-F1`, `RF-F2`):** Captures and validates the donor's legal name and Mexican tax ID (`RFC` pattern check) and flags the donation for staff follow-up.
- **Stripe Test Checkout & Webhook Automation:** Salesforce creates the Stripe test payment session, records the donation only after a successful payment (`RF-D3`, `RF-D4`), and sends the email receipt (`RF-D5`). Stripe webhooks record payments automatically (`RF-V3a`, `RF-V3b`).
- **Internal Staff & Treasury Console:** Allows coordination and treasury staff to manage campaigns (`RF-S1`), oversee all donations (`RF-S2`), manually confirm payments (`RF-S3`), and audit automatic confirmations and rejected webhooks (`RF-S4`).

---

## Repository Structure

```text
.
├── .husky/                        # Git hooks (Commitlint validation on commit-msg)
├── AI/
│   └── log.md                     # Chronological log of all AI-assisted changes (Rule 1)
├── docs/
│   ├── requirements/              # Software Requirements Specification (by domain)
│   │   ├── README.md              # Traceability matrix, scope, and discovery questions
│   │   ├── donor/                 # Public flow (general-flow.md) & modalities (modalities.md)
│   │   ├── admin/                 # Campaigns, treasury backoffice, and Stripe webhooks
│   │   └── architecture/          # Security/privacy (M1-M3, RF-V2) & technical standards
│   └── workflow/                  # Team engineering & Git governance documentation
│       ├── README.md              # End-to-end developer lifecycle overview
│       ├── commits-and-linting.md # Conventional Commits & Husky/Commitlint setup
│       ├── branching-and-merge-strategy.md # Feature branches, PR reviews & Squash Merge
│       ├── releases-and-tagging.md # SemVer & course milestone tags (entrega-1, entrega-2)
│       └── ai-and-documentation-logging.md # AI logbook & academic deliverable rules
├── AGENTS.md                      # Mandatory instructions and guardrails for AI agents
├── CLAUDE.md                      # Pointer linking Claude agents to AGENTS.md
├── commitlint.config.js           # Commitlint configuration (@commitlint/config-conventional)
├── lineamientos.md                # Original course project guidelines & grading rubric
└── package.json                   # Dev dependencies for Husky & Commitlint
```

---

## Getting Started

1. **Install Git Hook Dependencies:**
   ```bash
   npm install
   ```
   This automatically configures **Husky** and **Commitlint** to enforce Conventional Commits locally.
2. **Review Documentation:**
   - **Requirements:** [docs/requirements/README.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/README.md)
   - **Git & PR Workflow:** [docs/workflow/README.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/workflow/README.md)
   - **AI Agent Rules:** [AGENTS.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/AGENTS.md)
