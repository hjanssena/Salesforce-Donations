# End-to-End Test with Stripe Test Cards (#48)

Run on 2026-11-17 (times in Mérida, UTC−6) by Esmeralda Collí on the deployed web app (`https://dietpi.tail6cb6c6.ts.net:8443/`), campaign "Beca Mexico Dreamin' 2026", Stripe Test Mode. Only test cards, a team-owned test email and fictitious invoice data were used (`M1`). Salesforce results were checked with read-only queries in the org `class2026h`.

## Results

| # | Case | Card | Web app | Salesforce | Email | Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Credited, no invoice, 100 MXN (21:20) | `4242 4242 4242 4242` | Thank-you page shown; name on the supporters list; progress updated | Donation created (Website, not anonymous, Visible, 0 invoice requests); event `EVT-00032` Processed | Receipt job Completed with no errors; email not received (Inbox, Spam, Promotions) | ✅ Recording · ❌ Email |
| 2 | Anonymous, individual invoice, 250 MXN (21:49) | `4242 4242 4242 4242` | Thank-you page shown; donation not on the supporters list | Donation created (anonymous, no public name, 1 invoice request, taxpayer type Individual); event `EVT-00035` Processed | Receipt job Completed with no errors; email with invoice PDF not received; invoice request stays `Requested` | ✅ Recording · ❌ Email |
| 3 | Declined card, 100 MXN (22:15) | `4000 0000 0000 0002` | Error message shown | No donation created; event `EVT-00037` `payment_intent.payment_failed` logged only | None expected | ✅ |
| 4 | Abandoned: form filled, tab closed before paying | — | — | No donation and no event created | None expected | ✅ |

## Findings

1. **Receipts do not reach Gmail.** Salesforce accepts the email (the `DonationEmailJob` finishes as Completed), but nothing arrives. The likely cause is the open setup item in #47: no verified org-wide sender address. Reported in #47.
2. **Invoice requests stay `Requested`.** After the receipt job, the invoice request should change to `Sent` or `Failed`. Reported in #47.
3. **Test data.** Case 1 used the tester's own name as the public name, with her consent, and it stays visible. Later cases used fictitious names only.
4. **Shared record form.** Editing the donation from its record page is blocked by other teams' fields that the shared Opportunity layout marks as required (`serial`, `Cantidad Comidas`). Editing from the All Donations list view works. A Mexico Dreamin record page would remove this.

## Conclusion

Automatic payment confirmation (`RF-V3a`) works end to end: successful payments create exactly one donation each, anonymity and invoice choices are stored correctly, failed and abandoned payments create no donation, and the supporters list shows only credited names. Receipt and invoice delivery (`RF-D5`, `RF-F3`) remain open in #47.
