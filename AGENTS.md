# AGENTS.md — AI Agent Instructions & Governance

This file defines the mandatory operational rules and context for all AI coding assistants working on the **Mexico Dreamin Donation Portal (SF Vibe Lab)** project.

---

## Rule 1: Mandatory Change Logging (`AI/log.md`)

**Every user request that modifies anything in the project (code, configuration, metadata, or documentation) MUST be logged in [AI/log.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/AI/log.md) before concluding the turn.**

### Format
Each entry must follow this exact pipe-separated structure, fit on a **single line** (1 change per line), and ensure proper Markdown line-break rendering (prefix each entry with `- ` as a bullet list item or separate entries with a blank line `\n\n` so Markdown does not collapse consecutive lines into a single paragraph):

```text
- User | User request | Decision taken | Change made
```

- **User:** The person making the request (e.g., `Janssen`, or ask/infer from environment if unknown).
- **User request:** Brief summary of what the user asked for.
- **Decision taken:** Architectural, organizational, or implementation choice made.
- **Change made:** Concise list of files created, updated, or deleted.

---

## Rule 2: Salesforce Code Quality & Governor Limits (`C6` / `S11`, `S12`, `S14`)

1. **Strict Bulkification (`S12`):** Never place SOQL queries or DML statements inside `for`/`while` loops in Apex or Flows. All triggers, invocable methods, and record-triggered flows must safely handle bulk operations.
2. **No Hard-Coded IDs (`S14`):** Never hard-code Salesforce Record IDs (`001...`, `a00...`, Profile IDs, etc.) in Apex, Flows, LWCs, or Unit Tests. Unit tests must always use `SeeAllData=false` and create their own test data.
3. **Clean Exception Handling (`S11`):** Never expose raw Apex stack traces or unhandled Flow faults to the public Guest User. Ensure transactions roll back cleanly to prevent orphaned or inconsistent records, and ensure all code passes **Salesforce Code Analyzer**.

---

## Rule 3: User Story & Acceptance Criteria Standards (`C4` / `OA2`)

1. **No "How" in User Stories:** When writing or refining User Stories (`As a... I want... So that...`), never include technical implementation details (e.g., do not mention "LWC", "Apex", "Custom Object", "Flow", or "Webhook" in the story statement; the grading rubric penalizes stories that specify the "how").
2. **Strict `Given / When / Then` + Negative Cases:** All Acceptance Criteria must follow the `Given / When / Then` (`Dado / Cuando / Entonces`) format and explicitly include negative/edge validation scenarios alongside happy paths.

---

## Rule 4: Deliverable AI Audit Trail (`C3` — `docs/bitacora_ia.md`)

1. **Support for `docs/bitacora_ia.md`:** In addition to the quick change log in [AI/log.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/AI/log.md), the project is graded (20% weight) on a detailed deliverable log at `docs/bitacora_ia.md` (tracking Date, Author, Tool, Associated RF, Prompt/Summary, Output, Verification Method, Corrections, and Acceleration Estimate).
2. **Flagging AI Mistakes/Corrections:** Whenever an AI suggestion fails, hallucinates, hits a Salesforce platform limitation, or requires human correction, proactively highlight it so the team can record it toward the required minimum of **$\ge$ 3 documented AI errors and corrections**.

---

## Rule 5: Zero-Cost & Native Stack Constraint (Section 6)

1. **Allowed Stack Only:** Only design solutions using standard **Salesforce Developer Edition** capabilities (Experience Cloud / Salesforce Sites, LWC, Apex, Flow Builder), **Stripe Test Mode** (preferring `MXN` currency), VS Code, Salesforce CLI (`sf`), and GitHub.
2. **No Paid Add-Ons or Unapproved Packages:** Never introduce paid features, external hosting services, or third-party AppExchange packages unless explicitly approved by the professor.

---

## Rule 6: 5-Part Technical Blocker & Bug Reporting (`C7` — `docs/preguntas_y_reportes.md`)

Whenever helping debug a platform error, Guest User permission issue, or integration blocker, structure the diagnostic summary using the mandatory 5-part report format so it can be logged directly in `docs/preguntas_y_reportes.md`:
1. **Objective:** Specific User Story (`RF`) and Acceptance Criterion (`CA`) under test.
2. **Actions Executed:** Detailed technical steps taken.
3. **Expected Behavior:** Intended technical outcome.
4. **Actual Behavior:** Sanitized error log or behavior observed (zero secrets or PII).
5. **Prior Research:** Prompt used, AI/documentation response, and why it failed.

---

## Rule 7: Git Workflow, Commits, PRs & Releases (`docs/workflow/`)

Whenever performing or assisting with version control actions (creating branches, staging/committing, opening/merging PRs, or tagging releases), follow these rules and consult [docs/workflow/README.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/workflow/README.md):

1. **Conventional Commits:** All commit messages (and PR squash titles) must pass Husky + Commitlint (`<type>(<optional-rf-scope>): <description>`, e.g., `feat(rf-d1a): ...`). Reference: [commits-and-linting.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/workflow/commits-and-linting.md).
2. **Branching & Squash Merge:** Never commit or push directly to `main`. Use short-lived feature branches (`feat/rf-...`, `fix/rf-...`, `docs/...`), open a PR targeting `main`, require at least 1 peer review approval, and merge exclusively via **Squash and Merge**. Reference: [branching-and-merge-strategy.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/workflow/branching-and-merge-strategy.md).
3. **Releases & Tagging:** Releases on `main` use annotated Semantic Version tags (`vX.Y.Z`) alongside mandatory course deliverable tags (`entrega-1`, `entrega-2`). Reference: [releases-and-tagging.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/workflow/releases-and-tagging.md).

---

## Rule 8: English-Only Project Output

**All project work and artifacts MUST be written in English, even when the user prompts or converses in Spanish.**

1. **Code & Metadata:** All Apex classes, triggers, LWCs, Flows, Custom Objects/Fields API names, comments, and unit tests must be written in English.
2. **Documentation & Logs:** All documentation under `docs/`, entries in [AI/log.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/AI/log.md), User Stories, Acceptance Criteria (`Given / When / Then`), commit messages, branch names, and PR descriptions must be written in English.

---

## Mandatory Security & Privacy Guardrails (`M1–M3`, `OA5`, `OA6`)

1. **Requirements Reference:** All functional and non-functional requirements live in [docs/requirements/README.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/docs/requirements/README.md) (derived from [lineamientos.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/lineamientos.md)).
2. **Test Mode & Dummy Data Only (`M1`):** All Stripe integrations and test records must strictly use Stripe Test Mode, test cards, team-controlled test emails, and fictitious data. Never generate real CFDI tax receipts or query the live SAT service.
3. **Guest User Isolation (`M2`):** Enforce strict *least privilege*. Never grant read or modify access on `Donation` records to the unauthenticated Guest User beyond creating the initial `Pending` donation (`RF-D3`) and viewing aggregate campaign progress / `Paid` `Credited` donor recognition (`Name` + `Amount` only, never `Email` or `RFC`).
4. **Zero Secrets (`M3`):** Never hardcode or commit Stripe API keys, webhook signing secrets, credentials, or real PII in any source file, metadata, commit, screenshot, or log.
