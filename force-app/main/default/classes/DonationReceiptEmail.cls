/**
 * Builds the Spanish receipt email (RF-D5) for donations recorded from a verified website payment.
 * Intentional system access: it runs in the site guest's queued job, and the guest has no object CRUD.
 * It reads only the donations whose IDs the verified webhook passed in, and sends each receipt only to
 * the donor's own address. The display name appears only for credited donations.
 */
public without sharing class DonationReceiptEmail {
    private static final String PROGRAM_NAME = 'Mexico Dreamin';
    private static final String SOURCE_WEBSITE = 'Website';

    /**
     * Builds one receipt per recorded website donation that has a primary donor with an email.
     * @param donationIds IDs of donations the webhook has just recorded
     * @return the receipt messages, empty when there is nothing to send
     * @example
     * List<Messaging.SingleEmailMessage> receipts = DonationReceiptEmail.build(new Set<Id>{ donationId });
     */
    public static List<Messaging.SingleEmailMessage> build(Set<Id> donationIds) {
        List<Messaging.SingleEmailMessage> receipts = new List<Messaging.SingleEmailMessage>();
        if (donationIds == null || donationIds.isEmpty()) { return receipts; }
        List<Opportunity> donations = [SELECT Id, Amount, CloseDate, Is_Anonymous__c, Public_Name__c,
                Stripe_Payment_Intent_Id__c, Campaign.Name,
                (SELECT ContactId, Contact.Email FROM OpportunityContactRoles WHERE IsPrimary = true LIMIT 1)
            FROM Opportunity
            WHERE Id IN :donationIds AND Source__c = :SOURCE_WEBSITE AND IsWon = true
            WITH SYSTEM_MODE];
        Id senderAddressId = findSenderAddressId();
        for (Opportunity donation : donations) {
            if (donation.OpportunityContactRoles.isEmpty() ||
                String.isBlank(donation.OpportunityContactRoles[0].Contact?.Email)) { continue; }
            receipts.add(buildReceipt(donation, donation.OpportunityContactRoles[0].ContactId, senderAddressId));
        }
        return receipts;
    }

    private static Messaging.SingleEmailMessage buildReceipt(Opportunity donation, Id donorId, Id senderAddressId) {
        String campaignName = donation.Campaign?.Name ?? '';
        Boolean credited = donation.Is_Anonymous__c != true && String.isNotBlank(donation.Public_Name__c);
        List<List<String>> rows = new List<List<String>>{
            new List<String>{'Referencia', donation.Stripe_Payment_Intent_Id__c},
            new List<String>{'Campaña', campaignName},
            new List<String>{'Monto', formatAmount(donation.Amount)},
            new List<String>{'Fecha', formatDate(donation.CloseDate)}
        };
        if (credited) { rows.add(new List<String>{'Nombre público', donation.Public_Name__c}); }

        Messaging.SingleEmailMessage receipt = new Messaging.SingleEmailMessage();
        receipt.setTargetObjectId(donorId);
        receipt.setSaveAsActivity(false);
        receipt.setCharset('UTF-8');
        receipt.setSubject(('Recibo de tu donativo a ' + campaignName).left(200));
        receipt.setHtmlBody(htmlBody(rows));
        receipt.setPlainTextBody(textBody(rows));
        if (senderAddressId != null) {
            receipt.setOrgWideEmailAddressId(senderAddressId);
        } else {
            receipt.setSenderDisplayName(PROGRAM_NAME);
        }
        return receipt;
    }

    private static String htmlBody(List<List<String>> rows) {
        String table = '';
        for (List<String> row : rows) {
            table += '<tr><th style="text-align:left;padding:4px 16px 4px 0;">' + row[0].escapeHtml4() +
                '</th><td style="padding:4px 0;">' + (row[1] ?? '').escapeHtml4() + '</td></tr>';
        }
        return '<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2933;max-width:560px;">' +
            '<h1 style="font-size:22px;">¡Gracias por tu donativo!</h1>' +
            '<p>Registramos tu donativo a ' + PROGRAM_NAME + '. Este es tu recibo.</p>' +
            '<table style="border-collapse:collapse;">' + table + '</table>' +
            '<p style="font-size:13px;color:#52606d;">' + footer() + '</p></div>';
    }

    private static String textBody(List<List<String>> rows) {
        List<String> lines = new List<String>{'¡Gracias por tu donativo!', '',
            'Registramos tu donativo a ' + PROGRAM_NAME + '. Este es tu recibo.', ''};
        for (List<String> row : rows) { lines.add(row[0] + ': ' + (row[1] ?? '')); }
        lines.add('');
        lines.add(footer());
        return String.join(lines, '\n');
    }

    private static String footer() {
        return 'Ejercicio académico en modo de prueba: no se realizó ningún cargo real.';
    }

    private static Id findSenderAddressId() {
        String address = Stripe_Settings__c.getOrgDefaults()?.Sender_Email__c;
        if (String.isBlank(address)) { return null; }
        List<OrgWideEmailAddress> senders = [SELECT Id FROM OrgWideEmailAddress WHERE Address = :address
            WITH SYSTEM_MODE LIMIT 1];
        return senders.isEmpty() ? null : senders[0].Id;
    }

    /**
     * Formats an MXN amount as shown to donors, for example 1250.5 as "$1,250.50 MXN".
     * @param amount the donation amount
     * @return the formatted amount
     */
    @TestVisible
    private static String formatAmount(Decimal amount) {
        String[] parts = String.valueOf((amount ?? 0).setScale(2)).split('\\.');
        String whole = parts[0];
        String grouped = '';
        while (whole.length() > 3) {
            grouped = ',' + whole.right(3) + grouped;
            whole = whole.left(whole.length() - 3);
        }
        return '$' + whole + grouped + '.' + parts[1] + ' MXN';
    }

    /**
     * Formats a date as day/month/year, for example 2026-11-07 as "07/11/2026".
     * @param value the date
     * @return the formatted date, empty when the date is null
     */
    @TestVisible
    private static String formatDate(Date value) {
        if (value == null) { return ''; }
        return String.valueOf(value.day()).leftPad(2, '0') + '/' +
            String.valueOf(value.month()).leftPad(2, '0') + '/' + value.year();
    }
}
