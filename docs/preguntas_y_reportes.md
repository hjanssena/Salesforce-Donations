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
