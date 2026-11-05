# AI Change Log

Format: `- User | User request | Decision taken | Change made`

---

- Janssen | Analyze `lineamientos.md` and organize requirements in `docs/requirements/` by domain in English (Option 2). | Structured requirements into modular domain folders (`donor/`, `admin/`, `architecture/`) with a master traceability `README.md`. | Created `docs/requirements/README.md`, `donor/general-flow.md`, `donor/modalities.md`, `admin/campaign-management.md`, `admin/treasury-donations.md`, `admin/payment-webhooks.md`, `architecture/security-privacy.md`, and `architecture/technical-standards.md`.

- Janssen | Start up `AGENTS.md` with a linked `CLAUDE.md` and enforce Rule 1 to log every project/doc change in `AI/log.md`. | Defined Rule 1 and core project security guardrails in `AGENTS.md`, referenced `@AGENTS.md` from `CLAUDE.md`, and initialized `AI/log.md`. | Created `AGENTS.md`, `CLAUDE.md`, and `AI/log.md`.

- Janssen | Add the 5 additional rules from `lineamientos.md` to `AGENTS.md` and log the change. | Added Rules 2–6 covering Apex/Flow bulkification & testing (`C6`), User Story "no-how" formatting (`C4`), `docs/bitacora_ia.md` error tracking (`C3`), native zero-cost stack constraints, and 5-part bug reporting (`C7`). | Updated `AGENTS.md` and `AI/log.md`.

- Janssen | Create a `.gitignore` file for a Salesforce project and unstage all changes. | Added a standard Salesforce DX `.gitignore` covering `.sf/`, `.sfdx/`, `node_modules/`, OS files (`.DS_Store`), and secret files (`M3` protection), and unstaged all files from the Git index. | Created `.gitignore`, updated `AI/log.md`, and ran `git rm -r --cached .` to unstage all files.

- Janssen | Set up Husky for commit linting. | Configured Husky v9 with `@commitlint/cli` and `@commitlint/config-conventional` and added a `.husky/commit-msg` hook enforcing Conventional Commits. | Created `package.json`, `commitlint.config.js`, `.husky/commit-msg`, and updated `AI/log.md`.

- Janssen | Document merge strategy (feature branches, PR with review, squash merge to `main`, version tagging) and existing workflow in `docs/workflow/` with one file per topic. | Created modular workflow documentation in English under `docs/workflow/` covering commits/linting, branching/PR squash-merge, release tagging, and AI/documentation logging. | Created `docs/workflow/README.md`, `commits-and-linting.md`, `branching-and-merge-strategy.md`, `releases-and-tagging.md`, `ai-and-documentation-logging.md`, and updated `AI/log.md`.

- Janssen | Include brief Git workflow rules and references to `docs/workflow/` in `AGENTS.md`. | Added Rule 7 to `AGENTS.md` summarizing Conventional Commits, feature branches + PR review + Squash Merge, release tagging, and linking directly to the topic files in `docs/workflow/`. | Updated `AGENTS.md` and `AI/log.md`.

- Janssen | Add a rule to `AGENTS.md` requiring all project work to be written in English even when the user speaks in Spanish. | Added Rule 8 (English-Only Project Output) to `AGENTS.md` covering code, metadata, documentation, logs, user stories, commits, and PRs. | Updated `AGENTS.md` and `AI/log.md`.

- Janssen | Create the initial commit and push to the remote repository. | Staged all initial project documentation, Husky/Commitlint configuration, and agent rules, committed with a Conventional Commit message (`chore: initial project setup, requirements, and workflow docs`), and pushed `main` to `origin`. | Updated `AI/log.md` and pushed initial commit to `origin/main`.

- Janssen | Set up a brief root `README.md` detailing what the project does and its folder structure. | Created a concise root `README.md` in English covering project overview, key capabilities (`RF-*`), repository directory tree, and quick-start links. | Created `README.md` and updated `AI/log.md`.

- Janssen | Create the commit and PR for the root `README.md`. | Created feature branch `docs/project-readme`, committed `README.md` and `AI/log.md` following Conventional Commits, pushed the branch, and opened a PR targeting `main`. | Updated `AI/log.md`, pushed `docs/project-readme`, and opened a PR.

- Janssen | Fix `AI/log.md` line break formatting (one change per line) and add this rule to `AGENTS.md`, then commit and PR. | Formatted `AI/log.md` entries as individual Markdown list items separated by blank lines so each entry renders on its own line in Markdown, and updated Rule 1 in `AGENTS.md`. | Updated `AI/log.md`, `AGENTS.md`, and `docs/workflow/ai-and-documentation-logging.md`.

- Janssen | Read the user stories and identify missing stakeholder information, contradictions, and acceptance criteria needing more context. | Reviewed `docs/requirements/` and `lineamientos.md` in problem context only, without designing a solution; findings reported in chat. | No project files changed (analysis only).

- Janssen | Turn the findings into stakeholder questions, validate them against `lineamientos.md` and the stories, and keep a short artifact. | Wrote questions in the stakeholder's own process terms (no story IDs, "donations" wording), dropped questions the sources already answer, merged a teammate's campaign and donor questions, and removed duplicates. | Published and iterated a private Artifact "Stakeholder Questions" (outside the repo).

- Janssen | Compare the questions with the stakeholder's Slack answers, keep unanswered ones only, add the answers, and export the open questions. | Marked 4 questions as answered or handed to the team, narrowed 3, deleted the unconfirmed-donations question, reworded the manual-confirmation question to the stakeholder's current process, and added an "Answered so far" section. | Updated the Artifact; created open-question PDF and markdown copies in `~/Downloads` (outside the repo).

- Janssen | Save the stakeholder questions artifact as a markdown file in `docs/requirements`. | Stored the 17 open questions plus the stakeholder answers received so far in a single English file, using the existing kebab-case naming. | Created `docs/requirements/stakeholder-questions.md` and updated `AI/log.md`.

- Janssen | Make sure the whole exchange is reflected in the AI log and open a PR to `main`. | Added log entries for the analysis, question drafting, and answer comparison steps; used branch `docs/stakeholder-questions` with a Conventional Commit and a PR targeting `main`. | Updated `AI/log.md`, committed `AI/log.md` and `docs/requirements/stakeholder-questions.md`, and opened a PR.

- Janssen | Resolve the merge conflicts in the stakeholder questions PR. | Merged `origin/main` into `docs/stakeholder-questions` (no force push), took main's bullet format for `AI/log.md`, and re-added this branch's entries in that format. | Updated `AI/log.md` and merged the new `AGENTS.md` rule and workflow doc changes from `main`.

- Janssen | Update RF-S1 (goal cannot change once a campaign is active) and RF-D3 (donation recorded only after a successful payment) to match the stakeholder answers. | Replaced the goal-update criterion with a locked goal once the campaign starts, made activity depend on start and end dates, and rewrote RF-D3 around a record created as `Paid` after gateway authorization, with a negative case for unsuccessful payments. | Updated `docs/requirements/admin/campaign-management.md`, `docs/requirements/donor/general-flow.md`, `docs/requirements/README.md`, and `AI/log.md`.

- Janssen | Add the visitor message for when no campaign is open, as a story. | Created RF-D1c (E2) for browsing completed campaigns, with an explicit message and a negative case when no campaign is receiving donations; other pending story changes remain undecided. | Updated `docs/requirements/donor/general-flow.md`, `docs/requirements/README.md`, and `AI/log.md`.

- Janssen | Record the stakeholder's second round of Slack answers in the stakeholder questions document. | Moved 15 answered questions into a second-round answers table, kept the 2 questions still unanswered (who decides at 100% of the goal, site language), and left the stakeholder wording otherwise unchanged. | Updated `docs/requirements/stakeholder-questions.md` and `AI/log.md`.

- Janssen | Record the stakeholder questions, including those from the other two teams, in the markdown file. | Rewrote `stakeholder-questions.md` as a question log (question, asker, answer) grouped by topic, folded in the latest answers (close at 100%, no email for manual donations, English and Spanish), and listed 3 new follow-up questions. | Updated `docs/requirements/stakeholder-questions.md` and `AI/log.md`.

- Janssen | Record that the site will use English only and that two payments pushing a campaign past 100% are both accepted. | Changed the language answer to English only, moved the three follow-up questions into the answered tables (descriptions and invoice email in English, both payments accepted), and left no open questions. | Updated `docs/requirements/stakeholder-questions.md` and `AI/log.md`.

- Janssen | Fix the merge conflicts in the RF-D3 and RF-S1 story update PR. | Merged `origin/main` into `docs/update-rf-d3-and-rf-s1` without a force push and kept both sides of the `AI/log.md` conflict. | Updated `AI/log.md`; merged the stakeholder questions log from `main`.
