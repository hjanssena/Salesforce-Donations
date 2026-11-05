# Commits & Commit Linting

All commits in this repository must adhere to the **Conventional Commits** specification and are automatically validated locally via **Husky** and **Commitlint**.

---

## 1. Commit Message Format

```text
<type>(<optional-scope>): <short description>

[optional body]

[optional footer(s)]
```

### Allowed Types
| Type | When to Use | Example |
| :--- | :--- | :--- |
| `feat` | New feature or functional requirement (`RF-*`) implementation. | `feat(rf-d1a): add campaign progress LWC` |
| `fix` | Bug fix in Apex, Flows, LWCs, or configuration. | `fix(rf-f1): correct SAT RFC regex for persona moral` |
| `docs` | Documentation updates (`docs/`, `README.md`, `AI/log.md`, bitácoras). | `docs(workflow): add branching and merge strategy` |
| `chore` | Tooling, configuration, `.gitignore`, dependencies, or metadata sync. | `chore(husky): configure commitlint hook` |
| `refactor` | Code restructuring without changing external behavior. | `refactor(apex): bulkify donation trigger handler` |
| `test` | Adding or updating Apex unit tests, LWC Jest tests, or security tests. | `test(rf-v2): add guest user read isolation unit test` |
| `style` | Formatting, linting, whitespace (no functional changes). | `style(lwc): format campaign card template` |
| `ci` | GitHub Actions or automated verification pipelines. | `ci: add commitlint check on pull requests` |

> [!TIP]
> **Traceability Tip :** Whenever working on a specific functional requirement, include the requirement ID as the scope (e.g., `feat(rf-d3): create pending donation before checkout`). This makes it easy to link commits to tasks in the GitHub Project.

---

## 2. Automated Enforcement (Husky + Commitlint)

- **Hook Location:** [.husky/commit-msg](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/.husky/commit-msg)
- **Configuration:** [commitlint.config.js](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/commitlint.config.js) (`@commitlint/config-conventional`)

When you run `git commit -m "..."`, Husky automatically triggers Commitlint:
- If the message follows the specification, the commit succeeds.
- If the message is invalid (e.g., `git commit -m "updated files"`), the commit is rejected locally with an explanation.

### First-Time Setup for Team Members
After cloning the repository, run:
```bash
npm install
```
The `prepare` script in [package.json](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/package.json) automatically installs and activates the `.husky` hooks.

---

## 3. Pre-Commit Checklist

Before staging and committing files, verify:
1. **No Secrets (`M3`):** Confirm no Stripe keys, tokens, or `.env` files are staged (`git status` / `git diff --staged`).
2. **Metadata Backup:** If you modified declarative configurations in the Salesforce Org (Objects, Fields, Flows, Profiles, Sharing Rules), retrieve them first via `sf project retrieve start`.
3. **AI Change Log (Rule 1):** If an AI assistant modified code or documentation, ensure the change is recorded in [AI/log.md](file:///Users/janssen/Documents/UADY/Semestre7/Salesforce/Proyecto/AI/log.md).
