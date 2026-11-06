# Releases & Version Tagging

Releases are managed through **Git Tags** on the `main` branch. Because `main` only receives reviewed, squashed commits, any commit on `main` represents a clean, deployable state.

---

## 1. Versioning & Milestone Tagging Strategy

We combine **Semantic Versioning (`vX.Y.Z`)** for technical releases with the **mandatory course deliverable tags** required by Section 8 of [lineamientos.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/lineamientos.md).

### Semantic Versioning (`vX.Y.Z`)
- **`MAJOR` (`v1.0.0`, `v2.0.0`):** Major milestone completions (Deliverable 1 MVP, Deliverable 2 Full Release).
- **`MINOR` (`v0.1.0`, `v0.2.0`, `v1.1.0`):** Completed functional modules (`RF-*`) merged into `main`.
- **`PATCH` (`v1.0.1`):** Bug fixes, documentation refinements, or security hardening patches.

### Mandatory Course Milestone Tags
Per the official grading calendar (deadline **23:59 Mérida time** via Slack):

| Milestone | Due Date | Required Course Tag | Corresponding SemVer | Scope Required |
| :--- | :--- | :--- | :--- | :--- |
| **Deliverable 1 (E1)** | Tue, Nov 10, 2026 | `entrega-1` | `v1.0.0` | Public site URL, 5-min demo video, linked backlog with % progress, `docs/seguridad.md`, backed-up Salesforce metadata, and an updated AI logbook (`docs/bitacora_ia.md`) and the GitHub Project up to date. |
| **Deliverable 2 (E2)** | Tue, Nov 17, 2026 | `entrega-2` | `v2.0.0` | Complete E1 updates + automated Stripe webhook confirmation (`RF-V3a`), auto-receipts (`RF-D5`), webhook audit (`RF-S4`), and optional signature/idempotency validation (`RF-V3b`). |

---

## 2. How to Cut a Release

1. **Ensure `main` is Up to Date and Verified:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Verify Final Metadata & Logs:**
   - Confirm the latest Salesforce org metadata has been retrieved (`sf project retrieve start`) and merged into `main`.
   - Confirm `docs/bitacora_ia.md`, `docs/seguridad.md`, and `AI/log.md` are current, and the GitHub Project reflects the work done.
3. **Create Annotated Git Tag(s):**
   - For internal/semantic releases:
     ```bash
     git tag -a v1.0.0 -m "Release v1.0.0: Deliverable 1 MVP"
     git push origin v1.0.0
     ```
   - For official course submission milestones (`entrega-1` / `entrega-2`):
     ```bash
     git tag -a entrega-1 -m "Entrega 1: SF Vibe Lab Mexico Dreamin Portal"
     git push origin entrega-1
     ```
4. **Publish GitHub Release:**
   - Create a GitHub Release from the pushed tag with auto-generated release notes summarizing the squashed PRs included in the milestone.
