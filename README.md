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
- **Two Independent Donor Choices:**
  - **Recognition:** **Anonymous** (`RF-D2`) hides the donor from every public view and from the receipt; **Credited** (`RF-C1`) shows the donor's name and amount on the campaign's supporters list once paid.
  - **Invoice:** A donor may also request a tax-deduction invoice (`RF-F1`, `RF-F3`), which captures and validates the legal name and Mexican tax ID (`RFC` pattern check). It is independent of the recognition choice.
- **Spanish Site, Amounts in MXN:** The site and its emails are in Spanish. The minimum donation is 50 MXN with no maximum, and campaigns keep receiving donations after reaching their goal, until their end date (`RF-D1a`, `RF-D1b`, `RF-S1b`).
- **Stripe Test Checkout & Webhook Automation:** Salesforce creates the Stripe test payment session, records the donation only after a successful payment (`RF-D3`, `RF-D4`), and sends the email receipt (`RF-D5`). Stripe webhooks record payments automatically (`RF-V3a`, `RF-V3b`).
- **Internal Team Console with Three Roles (`RF-S5`):** **Admins** record donations received outside the website (`RF-S3`), follow invoice requests (`RF-F2`), and audit rejected payment notices (`RF-S4`); **campaign managers** create and configure campaigns (`RF-S1`); **moderators** review donor entries and hide or correct public names (`RF-C2`). All three can view donations, anonymous donors included (`RF-S2`).

---

## Repository Structure

```text
.
├── .github/workflows/            # Web CI and the blocked-ticket board automation
├── .husky/                        # Git hooks (Commitlint validation on commit-msg)
├── AI/
│   └── log.md                     # Chronological log of all AI-assisted changes (Rule 1)
├── docs/
│   ├── scope.md               # Features, non-goals, and open points
│   ├── architecture.md        # Services diagram, payment flow, data model diagram, decisions
│   ├── salesforce-api.md      # How Salesforce serves the API: site, Guest User, Apex REST, CORS, webhook
│   ├── contract.md            # API and PaymentIntent metadata between web app and Salesforce
│   ├── assets/                # Architecture diagrams (SVG)
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
├── web/                           # React web app, Dockerfile, Nginx config and deploy (see web/README.md)
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
   - **Scope (features and non-goals):** [docs/scope.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/scope.md)
   - **Architecture (services, data model):** [docs/architecture.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/architecture.md)
   - **Contract (web app ↔ Salesforce):** [docs/contract.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/contract.md)
   - **Salesforce API setup:** [docs/salesforce-api.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/salesforce-api.md)
   - **Web app (dev and deploy):** [web/README.md](web/README.md)
   - **Requirements:** [docs/requirements/README.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/README.md)
   - **Git & PR Workflow:** [docs/workflow/README.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/workflow/README.md)
   - **AI Agent Rules:** [AGENTS.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/AGENTS.md)
