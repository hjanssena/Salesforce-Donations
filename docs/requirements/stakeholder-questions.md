# Stakeholder Questions

Questions about how the program raises and handles donations for Mexico Dreamin today. The open questions come first, followed by the answers received so far from the stakeholder.

---

## Open Questions

### Campaigns

1. When a campaign reaches its goal, who decides whether it keeps receiving donations, and based on what?

### General

1. In which language should donors read the site?

---

## Answered So Far

### First round (Slack)

| Topic | Answer from the stakeholder |
| :--- | :--- |
| Signing in | Any visitor to the site can donate. No account or sign-in is needed. |
| Several campaigns | With more than one campaign, visitors see a list of them. With a single campaign, the site goes straight to it. |
| Smallest amount | As low as possible. The team checks what the payment gateway's documentation allows. |
| Suggested amounts and largest amount | The stakeholder asked the team to propose them. |
| Information asked for each type of donation | It depends on the type. For an invoice, the team works out the minimum information needed to issue one. |
| Proof of the donation | It depends on the type. The minimum is a ticket sent to the donor's email, and that includes anonymous donors. The team defines what it says. |
| Invoices | Tax deductions are in scope. Anyone who asks for a proper invoice should get one, not only companies. |
| Invoiced donors on the public list | Their donations must always be public, to prove the donation was made for SAT purposes. The team should look for edge cases. |
| Pending donations | A donation is pending only until the payment gateway authorizes it, so none stays pending indefinitely. The team reviews the gateway documentation for the details. |
| Campaign end date | Once the date has passed, the campaign stops receiving donations. There should always be at least one open campaign. |
| Campaign at 100% of its goal | There should be a way to mark whether the campaign keeps receiving donations. |

### Second round (Slack)

| Topic | Answer from the stakeholder |
| :--- | :--- |
| What to know about each donor | Only the name and whether the donor is a company. More information is needed only for the data required to issue an invoice for a tax-deduction claim. |
| Anonymous donors | Nothing is needed about them beyond sending them a ticket. |
| Same person donating twice by accident | Not considered possible: the donor has to go through the whole payment flow again, so it should not happen by accident. |
| Donations arriving outside the website | Donations made outside the payment gateway, such as bank transfers or the old manual process, are added manually. This is out of the project's scope. |
| Name shown in public | Donors can enter any name they want. There is no way to confirm that it is real. |
| Inappropriate names | A blacklist, plus a process for a moderator to remove an entry that looks ill-intentioned. |
| How many names are shown | All of them, as a list that scrolls automatically with an animation. The stakeholder is open to other suggestions. |
| Invoice requests | A form is enough. After the donor submits it, Salesforce sends the invoice to the donor. |
| Proof of the donation | The payment gateway's email is enough. The only other email a donor should receive is the one for a tax-deduction invoice request. |
| Creating campaigns and when they are active | Anyone with enough access creates a campaign and fills in when it starts and when it finishes. It has a goal amount and is active while the current date falls inside its time span. Who decides is otherwise out of scope. |
| What visitors see about a campaign | Description, images, deadline and purpose are all required for every campaign. |
| Completed campaigns | They stay visible, in a separate view. |
| Changing a campaign's goal | Once a campaign is active, its goal should not change, whether or not donations have come in. |
| Refunds and mistaken payments | Out of scope. |
| Checking that a donation was paid | There is no team for this at the moment. If the payment gateway authorized the transaction, it is successful. A record should be created only after a successful transaction. |
| Who can see and change donations | One person can manually create donations that come from outside. Another can change the name or the visibility. Both types of user can see email addresses. |
