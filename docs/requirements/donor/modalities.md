# Donor Domain — Donor Choices

Every donor makes two toggles that never affect each other:
1. **Recognition:** donate **anonymously** (`RF-D2`) or be **credited** on the campaign's supporters list (`RF-C1`). Only a credited donor is asked for a display name.
2. **Invoice:** request a tax-deduction invoice (`RF-F1`, `RF-F3`) or not. A donor who asks for one gives only the data the invoice needs.

Any combination is allowed. Requesting an invoice does not put a donation on the supporters list, and being credited does not request an invoice.

---

## RF-D2 · Donate Anonymously
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Anonymous Donor
- **User Story:** As an anonymous donor, I want to donate without my name appearing anywhere public, so that I can support the program without exposing my identity.

### Acceptance Criteria
- **CA1 (No Public Exposure):** **Given** I donated anonymously, **when** I inspect the public site (campaign pages, supporters list, thank-you page), **then** my name does not appear anywhere.
- **CA2 (Anonymous Receipt):** **Given** I donated anonymously, **when** I receive my receipt by email, **then** it shows no name.
- **CA3 (Email Only):** **Given** I choose to donate anonymously and do not request an invoice, **when** I fill in the form, **then** I am asked only for my email address.
- **CA4 (Negative: Email Required):** **Given** I choose to donate anonymously, **when** I submit the form without an email address, **then** submission is blocked and the form shows that the email is required.
- **CA5 (Anonymous With Invoice):** **Given** I donated anonymously and requested an invoice, **when** I fill in the form, **then** I am asked only for my email and the invoice data, and when I inspect the public site, neither my display name nor my invoice data appears.
- **CA6 (Team Visibility):** **Given** an anonymous donation exists, **when** an admin, a campaign manager, or a moderator views donations, **then** they see my email and the donation is marked `Anonymous`.

---

## RF-C1 · Appear as a Credited Donor
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Credited Donor
- **User Story:** As a credited donor, I want my name shown as a supporter of the campaign, so that my contribution is publicly recognized.

### Acceptance Criteria
- **CA1 (Details Requested):** **Given** I choose to be credited, **when** I fill in the form, **then** I am asked for the display name to show, my email address, and whether I donate as a company.
- **CA2 (Negative: Name Required):** **Given** I choose to be credited, **when** I submit the form without a display name, **then** submission is blocked and the form shows that the display name is required.
- **CA3 (Names As Entered):** **Given** I choose to be credited, **when** I enter any display name, **then** it is accepted as typed, because names are not verified.
- **CA4 (Supporters List):** **Given** I asked for credit and my donation is recorded, **when** any visitor opens that campaign, **then** they see my display name and amount in its supporters list. The list is per campaign.
- **CA5 (Minimal Data):** **Given** I asked for credit, **when** I inspect the supporters list, **then** it shows only my name and amount, with no email address or other personal data.
- **CA6 (Full List):** **Given** a campaign has many supporters, **when** I open it, **then** I can read every supporter's name and amount, because the list moves automatically when it does not fit.

---

## RF-F1 · Capture Tax Data for Invoice (RFC)
- **Milestone:** Deliverable 1 (E1)
- **Actor:** Donor Requesting an Invoice
- **User Story:** As a donor who needs a tax-deduction invoice, I want to give only the data my invoice needs, so that I receive it without sharing anything else.
- **Note:** Following the SAT's invoice requirements, the donor gives five items: full name, RFC, postal code of the fiscal address, fiscal regime, and the fiscal use of the invoice (uso fiscal). The program fills in the rest from the donation (see `RF-F3`).

### Acceptance Criteria
- **CA1 (Negative: Mandatory Fields):** **Given** I chose to request an invoice, **when** I submit the form without my full name, my RFC, the postal code of my fiscal address, my fiscal regime, the fiscal use of the invoice, or my email address, **then** submission is blocked and the form shows which one is missing.
- **CA2 (Negative: RFC Pattern):** **Given** I entered an RFC, **when** I submit the form, **then** it is checked against the SAT structural pattern (initial letters, 6-digit date, 3-character homoclave; 12 characters for a company, 13 for an individual) and any input that does not match is rejected. The live SAT service is not queried.
- **CA3 (Individual or Company):** **Given** I request an invoice, **when** I fill in the form, **then** I am asked whether I donate as an individual or as a company.
- **CA4 (Negative: Postal Code):** **Given** I entered a postal code, **when** it does not have exactly 5 digits, **then** submission is blocked and the form shows the postal code is not valid.
- **CA5 (Independent of Recognition):** **Given** I requested an invoice and did not choose to be credited, **when** I inspect the public site, **then** my donation is not on the supporters list and my invoice data appears nowhere.
- **CA6 (Negative: No Display Name Asked):** **Given** I requested an invoice and chose to be anonymous, **when** I fill in the form, **then** I am not asked for a display name.
- **CA7 (No Real CFDI):** **Given** I completed my donation with an invoice request, **when** the program is audited, **then** no real fiscal receipt (CFDI) was issued.

---

## RF-F3 · Receive Invoice by Email
- **Milestone:** Deliverable 2 (E2)
- **Actor:** Donor Requesting an Invoice
- **User Story:** As a donor who requested an invoice, I want to receive it by email, so that I can claim my donation as a tax deduction.
- **Open point:** Whether the invoice needs a tax breakdown ("cuando proceda") for a donation. No CFDI is included.

### Acceptance Criteria
- **CA1 (Invoice Email):** **Given** I donated and requested an invoice, **when** my payment succeeds, **then** I receive an invoice at the email address I gave.
- **CA2 (Invoice Content):** **Given** I receive my invoice, **when** I read it, **then** it shows my full name, RFC, postal code, fiscal regime and fiscal use, plus what the program fills in from the donation: a donation description, quantity 1, the amount as unit value and total, payment in a single payment, and payment by card.
- **CA3 (Negative: No Request):** **Given** I donated without requesting an invoice, **when** my payment succeeds, **then** I receive no invoice email.
- **CA4 (Negative: Unsuccessful Payment):** **Given** I requested an invoice, **when** my payment is declined, cancelled, or left unfinished, **then** I receive no invoice email.
- **CA5 (Spanish):** **Given** I receive an invoice email, **when** I read it, **then** it is written in Spanish.
