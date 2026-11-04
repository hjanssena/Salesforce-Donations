# AI Governance & Documentation Logging

To maintain full traceability and satisfy both our internal workflow and the **SF Vibe Lab** grading rubric (`C3`, `C7`, `C9`), every change in the repository is accompanied by structured documentation.

---

## 1. Quick AI Change Log (`AI/log.md` — Rule 1)

Defined in [AGENTS.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/AGENTS.md) and linked via [CLAUDE.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/CLAUDE.md):

- **When to update:** Every single time an AI coding assistant modifies project files, metadata, configuration, or documentation.
- **Format (1 change per line, with proper Markdown line breaks):**
  ```text
  - User | User request | Decision taken | Change made
  ```
- **Purpose:** Provides an immediate, chronological audit trail inside every PR of what the AI was asked to do and which files it touched.

---

## 2. Deliverable AI Logbook (`docs/bitacora_ia.md` — Criterion `C3`, 20 pts)

While `AI/log.md` tracks atomic agent file edits, `docs/bitacora_ia.md` is the formal academic deliverable evaluated in **E1** and **E2**:

- **Required Fields per Entry:**
  1. Date
  2. Author (all 3 team members must have balanced participation)
  3. AI Tool / Model used
  4. Associated Requirement (`RF-*`)
  5. Prompt / Summary of request
  6. Output obtained
  7. Verification method (how the team validated the output)
  8. Corrections applied
  9. Estimated time acceleration
- **Mandatory Error Tracking:** The team must document **at least 3 cases** where the AI hallucinated, produced a bug, or violated a Salesforce constraint, explaining how the team detected and corrected it.

---

## 3. Individual Contribution Log (`docs/contribucion.md` — Criterion `C9`, 5 pts)

- Every team member maintains their table of tasks completed across **E1** and **E2**.
- Each entry links directly to the **Squashed PR / Commit URL** on `main` and lists the hours invested.

---

## 4. Technical Questions & Bug Reports (`docs/preguntas_y_reportes.md` — Criterion `C7`, 15 pts)

Whenever a team member encounters a technical blocker or consults the advisor/client, it must be logged using the **5-Part Report Structure** (enforced by Rule 6 in [AGENTS.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/AGENTS.md)):
1. **Objective:** Specific `RF` and Acceptance Criterion (`CA`) under test.
2. **Actions Executed:** Detailed technical steps taken.
3. **Expected Behavior:** Intended technical outcome.
4. **Actual Behavior:** Sanitized error message or behavior observed (zero secrets/PII).
5. **Prior Research:** Prompt used, AI/documentation response, why it failed, and final resolution after advisor feedback.
