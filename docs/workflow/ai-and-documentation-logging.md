# AI Governance & Documentation Logging

To maintain full traceability and satisfy both our internal workflow and the **SF Vibe Lab** grading rubric (`C3`), every change in the repository is accompanied by structured documentation.

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

## 3. Individual Contributions (GitHub Project)

Individual contributions are not logged in a file. The team tracks them in its GitHub Project, where each task links to its squashed PR or commit on `main`. There is no `docs/contribucion.md`.

---

## 4. Technical Questions & Bug Reports

Not kept as a log. There is no `docs/preguntas_y_reportes.md` and no required report format; technical blockers go straight to the professor or client.
