# Questions & Reports (`preguntas_y_reportes.md`)

## 1. Slack Q&A Session — Requirements & Architecture Discovery

- **Date & Time:** Wednesday, November 4, 2026 · 12:00 PM – 1:19 PM (Mérida time)
- **Channel:** Official SF Vibe Lab Slack (`Stakeholder Questions.pdf` thread, 20 replies)
- **Participants:** Hugo Janssen (on behalf of the team: Hugo Janssen, Esmeralda Collí, Jesus Estrella) and **Maliachi** (Professor / Stakeholder & Technical Advisor)

### 1.1 Architectural Consultation: React Donor Site + Salesforce Backend

Before implementing the public site, the team asked the professor (in the technical advisor role) whether the donor-facing portal could be built as a standalone React web application while keeping Salesforce as the backend API, database, and internal staff console.

| Field | Detail |
| :--- | :--- |
| **Asked by** | Hugo Janssen (`12:00 PM`) |
| **Question** | *"Can we use React (or other front framework) in the project for the donors' site? Donors would use the React website and we would have Salesforce as a backend and admin portal."* |
| **Advisor Response (`Maliachi`, `12:26 PM`)** | *"Of course my horse. Feel free to implement as you feel is optimal for you, but plan ahead if you will not be using experience sites."* |
| **Associated Requirements** | `RF-V1`, `RF-V2`, `M2`, `M3`, Section 6 (Stack Constraints) |
| **Follow-Up & Architectural Impact** | 1. Recorded the approved exception in [AGENTS.md](../AGENTS.md) (Rule 5.2), [docs/scope.md](scope.md), and [docs/architecture.md](architecture.md).<br>2. Heeded the advisor's warning to *"plan ahead if you will not be using experience sites"* by designing a plain Salesforce Site exposing custom `@RestResource` Apex endpoints (`/services/apexrest/donations/v1/*`) to the unauthenticated Guest User ([docs/salesforce-api.md](salesforce-api.md)) and scheduling an early technical check (`#39`) to verify CORS preflight (`OPTIONS`) and Guest User access on the sandbox org before connecting the frontend. |

---

### 1.2 Stakeholder Requirements Q&A (`Stakeholder Questions.pdf`)

The team prepared a 15-question discovery document (`Stakeholder Questions.pdf`, 2 pages) grouped into seven business areas, written in non-technical language (`OA1`, `C4`). Below is the complete Q&A exchange from the Slack thread and how each answer shaped the backlog and architecture.

#### A. Donors and Giving (Questions 1–4)

| # | Question (`Stakeholder Questions.pdf`) | Stakeholder Answer (`Maliachi`) | Associated RF | Follow-Up Decision & Backlog Update |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Besides an email address, what else do you want to know about each donor, for example whether they are an alum, a family member or a company? | `[12:29 PM]` *"We don't need to know more than their name and whether they are a company. We will require more information to cover only the data required to fill a bill for claim tax deductions."* | `RF-C1`, `RF-F1` | Credited donors provide only a display name and email (`Public_Name__c` + `Contact.Email`). Whether the donor is an individual or a company (`Taxpayer_Type__c`) and fiscal fields are asked only when requesting an invoice (`Invoice_Request__c`); company invoices also link an `Account`. |
| **2** | If someone wants to stay anonymous, should your own team still be able to see who they are? | `[12:30 PM]` *"2. We don't need to know anything about them, we just need to send them a ticket."* | `RF-D2`, `RF-D5` | Anonymous donors do not submit a display name (`publicName` is rejected with `NOT_ALLOWED` if sent). Only `donorEmail` is collected so Salesforce can send their payment receipt (`RF-D5`). |
| **3** | If the same person gives twice by accident, what would you want to happen? | `[12:32 PM]` *"3. I don't think that's possible; they had to go through the entire payment flow again. At that point, that shouldn't be an accident."* | `RF-D3`, `RF-V3b` | Repeat donations by the same donor are valid separate `Opportunity` records linked to the same `Contact` (matched by email). Technical duplicate protection (`RF-V3b`) applies strictly to repeated webhook deliveries of the same `Stripe_Event_Id__c` or `Stripe_Payment_Intent_Id__c`. |
| **4** | Do donations arrive outside the website?<br><br>**Clarification (`Hugo Janssen`, `1:03 PM`):** *"By outside we mean receiving donations not through Stripe (like bank transfers, or the old manual process you as a business used to have). If so, we would need a way for you to register that donation into the system so the goal stays up-to-date."* | `[12:33 PM]` *"4. wdym by outside?"*<br>`[1:05 PM]` *"4. Yeah it could be, but those will be added manually, this is out of the project's scope."* | `RF-S3` | External bank transfers are not integrated; instead, `RF-S3` was refined so an Admin can manually record a paid donation (`Source__c = Manual`) in Salesforce to keep the campaign's `AmountWonOpportunities` roll-up accurate (no receipt email sent). |

#### B. Public Thanks (Questions 5–6)

| # | Question (`Stakeholder Questions.pdf`) | Stakeholder Answer (`Maliachi`) | Associated RF | Follow-Up Decision & Backlog Update |
| :--- | :--- | :--- | :--- | :--- |
| **5** | *(Public thanks 1)* Can donors choose the name shown in public, such as a company or a family name? | `[12:34 PM]` *"5. Yes, they can put anything they want, we don't have a way to confirm the information is real."* | `RF-C1` | Credited donors enter a free-text `publicName` (1–80 characters), stored in `Opportunity.Public_Name__c` and shown on the campaign supporters wall alongside their donation amount. |
| **6** | *(Public thanks 2)* Who decides whether a name is appropriate to display, and how many names should be shown at once? | `[12:37 PM]` *"6. These are two questions:<br>6.1 Honestly, idk, we can have a blacklist and a process to remove an entry if a moderator sees a bad-intentioned input<br>6.2 As many as there are. I'm thinking in a list that autoscroll with an animation, you can suggest other solutions"* | `RF-C1`, `RF-C2` | **6.1:** Added `Banned_Word__mdt` (checked at payment-session validation) and `Display_Status__c` (`Visible` / `Hidden`) on `Opportunity` so Moderators can hide or correct ill-intentioned display names (`RF-C2`).<br>**6.2:** `GET /campaigns/{id}` returns all visible credited donations (newest first) for the supporters list (`RF-C1`). |

#### C. Tax Invoices & Proof of Donation (Questions 7–8)

| # | Question (`Stakeholder Questions.pdf`) | Stakeholder Answer (`Maliachi`) | Associated RF | Follow-Up Decision & Backlog Update |
| :--- | :--- | :--- | :--- | :--- |
| **7** | *(Tax invoices 1)* When a donor asks for an invoice, who would deal with the request, and how does the donor receive it? | `[12:39 PM]` *"7. A form should do the trick, and after a submission, I would like SF to send the invoice to the user."* | `RF-F1`, `RF-F2`, `RF-F3` | Added story `RF-F3` and custom object `Invoice_Request__c` (capturing legal name, RFC, taxpayer type, 5-digit postal code, SAT tax regime, CFDI use, and invoice email). Salesforce flags the request for staff (`RF-F2`) and emails the simulated invoice (`RF-F3`, no real CFDI per `M1`). |
| **8** | *(Proof of the donation 1)* Is the ticket the payment gateway emails enough as proof, or do you want one from the program as well? In which language should it be written? | `[12:41 PM]` *"8. The payment gateway email is enough; the only extra email they should receive is when they ask for a claim tax deduction bill."* | `RF-D5`, `RF-F3` | Because Stripe **Test Mode** does not send live receipt emails to arbitrary addresses, Salesforce sends the single payment receipt email (`RF-D5`) once payment is confirmed, plus the invoice email when requested (`RF-F3`). In a follow-up session (2026-11-05), the stakeholder confirmed all donor-facing copy and emails are in **Spanish**. |

#### D. Campaigns (Questions 9–12)

| # | Question (`Stakeholder Questions.pdf`) | Stakeholder Answer (`Maliachi`) | Associated RF | Follow-Up Decision & Backlog Update |
| :--- | :--- | :--- | :--- | :--- |
| **9** | *(Campaigns 1)* When does a campaign start, and who decides when a campaign is active, inactive or completed? | `[12:44 PM]` *"9. I think this is out of the scope of the project. For the moment, anyone with enough access should create a campaign and fill in the information about when it starts and when it finishes. Should have an amount as a goal, and will be active if the current date falls in the campaign's time-span."* | `RF-S1`, `RF-S1b`, `RF-D1a` | Campaign Managers create `Campaign` records with `StartDate`, `EndDate`, and `ExpectedRevenue` (goal). A campaign is `open` when `StartDate <= TODAY <= EndDate` (in `America/Merida`) and `completed` once `EndDate < TODAY` (`RF-S1b`). Future campaigns (`StartDate > TODAY`) are never returned publicly. |
| **10** | *(Campaigns 2)* Besides its name, goal and amount raised, what should visitors see about each campaign, such as a description, images, a deadline or what the money is for? | `[12:45 PM]` *"10. Yes, all those information is required for each campaign."* | `RF-D1a`, `RF-S1` | Added required custom fields on `Campaign` (`Purpose__c`, `Image_URL__c`) alongside standard `Name`, `Description`, `ExpectedRevenue`, `AmountWonOpportunities`, `StartDate`, and `EndDate`, enforced via validation rules (`Campaign_Required_Fields`) and exposed in `GET /campaigns`. |
| **11** | *(Campaigns 3)* Should completed campaigns stay visible to visitors as a record of past fundraising? | `[12:47 PM]` *"11. Yeah, I think they should stay visible, but in another view."* | `RF-D1c` | Created user story `RF-D1c`: `GET /campaigns?status=completed` returns past campaigns sorted by `endDate` (latest first), and the web app provides a dedicated `/campanas/finalizadas` read-only view. |
| **12** | *(Campaigns 4)* Could your team change a campaign's goal after donations have come in, whether raising it or lowering it below the amount already raised? | `[12:51 PM]` *"12. Hmmm i don't think so, after a campaign is active, we shouldn't change the goal, doesn't matter if there are donations or not."* | `RF-S1` | Replaced the original `lineamientos.md` criterion (`RF-S1 CA2`) with a strict immutability rule: once a campaign starts (`StartDate <= TODAY`), its goal (`ExpectedRevenue`) cannot be modified, enforced by the `Lock_Goal_When_Active` validation rule on `Campaign`. |

#### E. Donations That Do Not Go Through & Team Access (Questions 13–15, Page 2)

| # | Question (`Stakeholder Questions.pdf`) | Stakeholder Answer (`Maliachi`) | Associated RF | Follow-Up Decision & Backlog Update |
| :--- | :--- | :--- | :--- | :--- |
| **13** | *(Donations that do not go through 1)* How should we handle refunds or mistaken payments? Who approves them, and should a confirmed donation ever be undone? | `[1:07 PM]` *"13. Out of scope."* | Scope Non-Goal | Documented refunds and mistaken-payment reversal as explicit non-goals in [docs/scope.md](scope.md) and [docs/requirements/README.md](requirements/README.md). |
| **14** | *(Donations that do not go through 2)* Today, how does your team check that a donation was actually paid, and what would you do if the payment processor showed one thing and your records another? | `[1:13 PM]` *"14. Haha there is no such thing as a team for the moment. If the payment gateway has authorized the transaction, it is successful.<br>14.1 a record should be created only AFTER a successful transaction"* | `RF-D3`, `RF-S3`, `RF-V3a` | Crucial architectural pivot: instead of creating `Pending` donations before payment, donor details are validated by Salesforce and attached to the Stripe `PaymentIntent` metadata. An `Opportunity` (`StageName = Closed Won`) is created **only after** Stripe confirms a successful payment (confirmed with the professor on issue `#32`). |
| **15** | *(Your team 1)* Who should be able to see donors' email addresses, and who may change a donation after it is recorded? | `[1:16 PM]` *"15. One person can manually create donations if they come from outside, and another can change the name or the visibility. Email's are visible for both types of users."* | `RF-S5`, `RF-S2`, `RF-S3`, `RF-C2` | Added user story `RF-S5` and [docs/requirements/admin/roles.md](requirements/admin/roles.md), defining three Permission Sets (**Donations Admin**, **Campaign Manager**, **Moderator**): Admins record manual donations (`RF-S3`), Moderators edit `Public_Name__c` and `Display_Status__c` (`RF-C2`), all three roles view donations and emails (`RF-S2`), and only Admins and Campaign Managers can view `RFC__c` (`RF-F2`). |

---

## 2. Technical Reports — Esmeralda Collí

Problems found while building the Salesforce data model, roles and staff application (part B). Each report follows the five parts in `lineamientos.md` (objective, actions, expected behavior, actual behavior, prior research) plus the follow-up. AI details for the same cases are in [bitacora_ia.md](bitacora_ia.md).

### 2.1 Data model guide did not match the agreed architecture

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-07 |
| **Requirement** | `RF-S5`, `RF-F2` |
| **Objective** | Create the custom fields and objects for donations, invoice requests and Stripe notices in the shared org `class2026h`. |
| **Actions** | Followed a step-by-step Setup guide and created `Modality__c` (Anonymous / Credited / Invoiced), a `Donor__c` lookup on Opportunity, `Source__c` with Stripe / Manual, and `Invoice_Request__c` without SAT fields. |
| **Expected behavior** | A data model that matches [architecture.md](architecture.md) and the API contract, ready to retrieve into the repository. |
| **Actual behavior** | When compared with the architecture docs, the model did not fit: one `Modality__c` value cannot represent a donor who is anonymous and also wants an invoice, the donor link must be the contact role, `Source__c` must be Website / Manual, and the invoice object was missing postal code, tax regime, CFDI use and a Failed status. |
| **Prior research** | Prompt: *"Give me the steps for my part B."* The guide was based on an older version of the plan and was not checked against the repository's architecture docs before building. |
| **Follow-up** | Deleted `Modality__c` and `Donor__c`, created `Is_Anonymous__c`, renamed Stripe to Website, added the SAT fields, the Failed status and `Stripe_Event__c.Opportunity__c`. Resolved on 2026-11-07. Rule adopted: read the architecture docs before creating anything in Setup. |

### 2.2 Display Status picklist saved as one broken value

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-10 |
| **Requirement** | `RF-C1`, `RF-C2` |
| **Objective** | Create `Display_Status__c` on Opportunity with the values Visible and Hidden, so moderators can hide names on the supporters list. |
| **Actions** | Copied the values from a table cell into the picklist values box in Setup. |
| **Expected behavior** | Two values, `Visible` (default) and `Hidden`. |
| **Actual behavior** | The field had a single value, `Visible<br>Hidden`. The public API filters on exactly `Visible`, so no donation could be shown or hidden correctly. Found when a new Donation form showed the wrong option. |
| **Prior research** | Prompt: *"Done"*, to ask for the next step (Opportunity fields). The answer listed picklist values separated by an HTML line break, which pasted as text. The other picklists were checked and were correct. |
| **Follow-up** | Renamed the value to `Visible`, added `Hidden`, kept Visible as default and retrieved the metadata again. Resolved on 2026-11-10. Since then every picklist is opened after saving to confirm its values. |

### 2.3 Role users could not create campaigns or manual donations

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-10 |
| **Requirement** | `RF-S3`, `RF-S5`, `RF-S1` |
| **Objective** | Prove each acceptance criterion with Apex tests that run as a user holding only one team role. |
| **Actions** | Wrote `StaffConsoleConfigurationTest` (18 tests at the time) that creates test users inside the test, assigns each permission set and tries each action in user mode. Ran it as a validation-only deploy so nothing was saved in the shared org. |
| **Expected behavior** | All tests pass, because the configuration worked when checked as System Administrator. |
| **Actual behavior** | 9 of 18 tests failed. Campaign and Opportunity have record types in this org (NPSP and other teams): the value Manual of `Source__c` was not enabled on the Donation record type, and the permission sets gave no record type access, so Admin and Campaign Manager users could not create campaigns or donations. |
| **Prior research** | Prompt: *"I want to finish all the tests."* The earlier setup guide never mentioned record types, and checking as System Administrator hid the problem because that profile sees every record type. |
| **Follow-up** | Enabled Manual and Visible / Hidden on the Donation record type and gave Donations Admin and Campaign Manager their record types, by hand in Setup because the record type is shared with other teams. All tests passed on 2026-11-10; the class now has 22 tests. |

### 2.4 Another team's trigger adds our donations to its fund

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-10 |
| **Requirement** | `RF-S3`, `RF-D3`, risk R9 |
| **Objective** | Create test donations in the shared org to show manual entry (`RF-S3`) and the donation list in the demo. |
| **Actions** | Investigated why the tests needed a campaign called "FONDOS SDU" before they could insert any Opportunity, and read the org's `OpportunityTrigger`. |
| **Expected behavior** | A Mexico Dreamin donation changes only its own campaign's progress. |
| **Actual behavior** | Another team's `OpportunityTrigger` runs on every Opportunity insert in the org and adds each Closed Won amount to their "FONDOS SDU" campaign. A demo donation would change that team's total, and inserts failed when the campaign did not exist. |
| **Prior research** | The test failure message pointed to the missing campaign; reading the trigger code showed it is not scoped to one project. No setting can turn it off without changing another team's code. |
| **Follow-up** | Decided not to create demo donations by hand, told the team, and recorded it as residual risk R9 in [seguridad.md](seguridad.md). Jesús later added missing-fund guards so our recording works whether or not the fund exists (2026-11-17). Still open: agree on fund scoping with the professor and that team. |

### 2.5 Name moderation flow rejected at deploy

| Field | Detail |
| :--- | :--- |
| **Date** | 2026-11-16 |
| **Requirement** | `RF-C2` |
| **Objective** | Block a display name with a banned word when a moderator corrects it, using a record-triggered flow on Opportunity. |
| **Actions** | Wrote the flow as metadata (`Public_Name_Banned_Words`): get the banned words, loop over them, compare whole words, and show an error on `Public_Name__c`. Deployed it with a validation-only deploy and the tests. |
| **Expected behavior** | The flow deploys and the new test `correctedNameWithBannedWordIsRejected` passes. |
| **Actual behavior** | Deploy failed: *"Element getRecords invalid at this location in type Flow"*. |
| **Prior research** | Prompt: *"I want to continue with my part of E2: the rejected payment notices log (RF-S4) and name moderation (RF-C2)…"* The generated file used `getRecords`, the label shown in Flow Builder, but the metadata name for that element is `recordLookups`, and elements must be in a fixed order. |
| **Follow-up** | Renamed the element to `recordLookups` and moved it to its place in the file. Deploy passed with 33 of 33 tests on 2026-11-16 and the change was merged in PR #98 on 2026-11-17. Also found that maintaining banned words needs Customize Application, so admins keep the list (least privilege). |
