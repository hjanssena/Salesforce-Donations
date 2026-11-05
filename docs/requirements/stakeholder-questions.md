# Stakeholder Questions

Log of the questions put to the stakeholder about how the program raises and handles donations for Mexico Dreamin, with the answers received in Slack. It includes the questions from this team and from two other teams, who are called **Another team (A)** and **Another team (B)** below. Questions written in Spanish are translated to English.

Answers marked **Team decision** are not the stakeholder's words. They record how this team chose to handle a stakeholder wish.

---

## Open Questions

None at the moment. The follow-up questions raised while writing the stories have all been answered.

---

## Answered Questions

### Site access and campaigns

| Question | Asked by | Answer |
| :--- | :--- | :--- |
| What does "no login" mean? Is it wrong to have a registration through a token, or must the user go straight to a donation form? | Another team (A) | Any visitor to the site should be able to donate. The stakeholder did not understand what registering with a token meant. |
| How do several campaigns work: one site listing all active campaigns, or a separate page or site per campaign? | Another team (A) | If there is more than one campaign, visitors see a list. With a single campaign, the site goes straight to it. |
| When does a campaign start, and who decides when it is active, inactive or completed? | This team | Anyone with enough access creates a campaign and fills in when it starts and finishes. It has a goal amount and is active while the current date falls inside its time span. Who decides is otherwise out of scope. |
| Besides its name, goal and amount raised, what should visitors see about each campaign? | This team | Description, images, deadline and purpose are all required for every campaign. |
| Should completed campaigns stay visible to visitors as a record of past fundraising? | This team | Yes, in a separate view. |
| Could the team change a campaign's goal after donations have come in? | This team | No. Once a campaign is active, its goal should not change, whether or not donations have come in. |
| When a campaign reaches 100% of its goal or the event date has passed, should it keep accepting donations? | Another team (B) | After the date, stop receiving donations. At 100%, the campaign also stops receiving donations. |
| When a campaign reaches its goal, who decides whether it keeps receiving donations? | This team | Nobody decides. The campaign stops receiving donations when it reaches 100%. |
| If two payments arrive close together and push a campaign past 100%, should both be accepted? | This team | Yes. |
| There should always be an open campaign. What should happen when none is open? | This team | **Team decision:** visitors see a message that no campaign is receiving donations right now, and they can browse completed campaigns. |

### Donations and donor information

| Question | Asked by | Answer |
| :--- | :--- | :--- |
| What should the minimum amount be? $50? | Another team (A) | As low as possible. The team checks what the payment gateway's documentation allows. |
| Which suggested and custom amounts should be shown, and should there be a minimum or maximum per transaction? | Another team (B) | The stakeholder asked the team what amounts it suggests. The team proposes them. The minimum is whatever the gateway allows. |
| What information is asked of the donor? | Another team (A) | It depends on the donation type. For an invoice, the stakeholder asked back what minimum information is needed to issue one for a tax-deduction claim, so the team works it out. |
| Besides an email address, what else do you want to know about each donor? | This team | Only the name and whether the donor is a company. More is needed only for the data required to issue an invoice for a tax-deduction claim. |
| If someone stays anonymous, should the team still be able to see who they are? | This team | Nothing is needed about them beyond sending them a ticket. |
| Should an anonymous donor's email be required for the receipt, or optional? | Another team (B) | The minimum is a ticket sent to the donor's email, so the email is needed for every donation type. |
| If the same person gives twice by accident, what should happen? | This team | Not considered possible: the donor has to go through the whole payment flow again, so it should not happen by accident. |
| Do donations arrive outside the website? (Clarified as bank transfers or the old manual process.) | This team | They are added manually, which is out of the project's scope. The system only needs to update the campaign's goal progress. No email is sent for them. |

### Public recognition

| Question | Asked by | Answer |
| :--- | :--- | :--- |
| If a donor chooses an invoice, should their name and amount appear on the public recognition list? | Another team (B) | Yes, always. These donations must be public to prove the donation was made for SAT purposes. The team should investigate edge cases. |
| Can donors choose the name shown in public? | This team | Yes. Donors can enter any name they want, and there is no way to confirm it is real. |
| Who decides whether a name is appropriate to display? | This team | A blacklist, plus a process for a moderator to remove an entry that looks ill-intentioned. |
| How many names should be shown at once? | This team | All of them, as a list that scrolls automatically with an animation. The stakeholder is open to other suggestions. |

### Invoices and proof of the donation

| Question | Asked by | Answer |
| :--- | :--- | :--- |
| Do invoices apply only to companies? Can donors be invoiced? | Another team (A) | Tax deductions are in scope. Anyone who asks for the proper invoice should get one. No CFDI will be included. |
| When a donor asks for an invoice, who deals with the request and how does the donor receive it? | This team | A form is enough. After the donor submits it, Salesforce sends the invoice to the donor. |
| What does "sending the receipt" mean: is Stripe's ticket enough, or should a custom receipt be generated? | Another team (A) | It depends on the donation type. A ticket in the donor's email is the minimum. |
| Is the proposed receipt content enough: reference number, campaign, amount, date, donation type and donor name (if not anonymous)? | Another team (B) | Same answer: it depends on the type, and the team works out the minimum. |
| Is the payment gateway's ticket enough as proof, or do you want one from the program as well? | This team | The gateway's email is enough. The only other email a donor should receive is the one for a tax-deduction invoice request. **Team decision:** Salesforce sends the receipt itself once the payment is confirmed, because Stripe sends no receipt emails in test mode. The donor still receives one email, plus the invoice when requested. |

### Payments and records

| Question | Asked by | Answer |
| :--- | :--- | :--- |
| What should happen to pending donations that are never completed? Should they expire after some days or stay pending? | Another team (B) | The payment gateway controls this. A donation is pending only while the payment has not been authorized, so none stays pending indefinitely. |
| Should the manual acceptance flow exist, and for which cases? | Another team (A) | The stakeholder did not understand the question. |
| Should there be a button to confirm payments manually? | Another team (A) | The stakeholder did not understand the question. |
| How does the team check that a donation was actually paid? | This team | There is no team for this at the moment. If the payment gateway authorized the transaction, it is successful. A record should be created only after a successful transaction. |
| How should refunds or mistaken payments be handled? | This team | Out of scope. |

### Staff and access

| Question | Asked by | Answer |
| :--- | :--- | :--- |
| Are reports customized or automatic? | Another team (A) | The stakeholder asked what "automatic reports" means. No answer was given. |
| Who should be able to see donors' email addresses, and who may change a donation after it is recorded? | This team | One person can manually create donations that come from outside. Another can change the name or the visibility. Both types of user can see email addresses. |

### Language

| Question | Asked by | Answer |
| :--- | :--- | :--- |
| In which language should donors read the site? | This team | English only. The stakeholder first answered English and Spanish, then confirmed that only English will be used. |
| Are campaign descriptions required in both English and Spanish? | This team | Not needed, since only English is used. |
| In which language should the invoice email be written? | This team | English, since only English is used. |
