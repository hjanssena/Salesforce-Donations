/**
 * Tests the simulated invoice (RF-F3): PDF content, its attachment to the receipt email, who receives it,
 * and how the invoice request status is recorded. A fake sender replaces Salesforce email.
 */
@IsTest
private class DonationInvoicePdfTest {
    private static final String CAMPAIGN_NAME = 'Invoice test campaign';
    private static final String DONOR_EMAIL = 'invoice.donor@example.com';
    private static final String INVOICE_EMAIL = 'facturas.test@example.com';
    private static final String LEGAL_NAME = 'María José Núñez & Ávila';

    private class RecordingSender implements DonationEmailJob.Sender {
        public List<Messaging.SingleEmailMessage> sent = new List<Messaging.SingleEmailMessage>();
        public void send(List<Messaging.SingleEmailMessage> messages) { sent.addAll(messages); }
    }

    @TestSetup
    static void setup() {
        Date today = CampaignService.today();
        Campaign item = new Campaign(Name=CAMPAIGN_NAME, Description='Fictitious test campaign',
            Purpose__c='Academic test', Image_Url__c='https://example.com/test.png', ExpectedRevenue=1000,
            StartDate=today.addDays(-1), EndDate=today.addDays(1));
        Map<String, Schema.SObjectField> fields = Campaign.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).fields.getMap();
        if (fields.containsKey('Visibility_Start_Date__c')) {
            item.put('Visibility_Start_Date__c', item.StartDate); item.put('Visibility_End_Date__c', item.EndDate);
        }
        insert as system item;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────

    private static Id recordDonation(String suffix, String invoiceEmail, String taxpayerType) {
        Id campaignId = [SELECT Id FROM Campaign WHERE Name = :CAMPAIGN_NAME WITH SYSTEM_MODE LIMIT 1].Id;
        Map<String, Object> input = new Map<String, Object>{'campaignId'=>campaignId, 'amount'=>1250.5,
            'donorEmail'=>DONOR_EMAIL, 'isAnonymous'=>true};
        if (invoiceEmail != null) {
            Boolean company = taxpayerType == 'company';
            input.put('invoice', new Map<String, Object>{'fullName'=>LEGAL_NAME,
                'rfc'=>company ? 'EEJ800101AB1' : 'NUAM800101ABC', 'taxpayerType'=>taxpayerType,
                'postalCode'=>'97000', 'taxRegime'=>company ? '603' : '612', 'cfdiUse'=>'D04', 'email'=>invoiceEmail});
        }
        String event = JSON.serialize(new Map<String, Object>{'id'=>'evt_' + suffix, 'type'=>'payment_intent.succeeded',
            'livemode'=>false, 'data'=>new Map<String, Object>{'object'=>new Map<String, Object>{'id'=>'pi_' + suffix,
                'livemode'=>false, 'status'=>'succeeded', 'currency'=>'mxn', 'amount_received'=>125050,
                'metadata'=>PaymentSessionService.buildMetadata(input)}}});
        return DonationRecorder.recordVerifiedEvent(event).opportunityId;
    }

    private static Opportunity loadDonation(Id donationId) {
        return [SELECT Amount, CloseDate, Stripe_Payment_Intent_Id__c, Campaign.Name,
                (SELECT Legal_Name__c, RFC__c, Taxpayer_Type__c, Postal_Code__c, Tax_Regime__c, Cfdi_Use__c,
                    Invoice_Email__c FROM Invoice_Requests__r)
            FROM Opportunity WHERE Id = :donationId WITH SYSTEM_MODE];
    }

    private static Messaging.SingleEmailMessage buildEmail(Id donationId) {
        return DonationReceiptEmail.build(new Set<Id>{donationId})[0];
    }

    private static Invoice_Request__c loadInvoice(Id donationId) {
        return [SELECT Status__c, Sent_At__c FROM Invoice_Request__c WHERE Opportunity__c = :donationId WITH SYSTEM_MODE];
    }

    // ─── PDF content ─────────────────────────────────────────────────────

    @IsTest
    static void shouldShowEveryRequiredItemWhenRenderingInvoice() {
        Opportunity donation = loadDonation(recordDonation('content', DONOR_EMAIL, 'individual'));

        Test.startTest();
        String html = DonationInvoicePdf.html(donation, donation.Invoice_Requests__r[0]);
        Test.stopTest();

        for (String expected : new List<String>{LEGAL_NAME, 'NUAM800101ABC', '97000',
                '612 - Personas Físicas con Actividades Empresariales', 'D04 - Donativos', 'Persona física',
                'Donativo - ' + CAMPAIGN_NAME, '$1,250.50 MXN', 'PUE - Pago en una sola exhibición', 'Tarjeta',
                'Donativo no objeto de IVA', 'pi_content'}) {
            Assert.isTrue(html.contains(expected.escapeHtml4()), 'The invoice shows: ' + expected);
        }
        Assert.isTrue(html.contains('>1</td>'), 'Quantity 1');
    }

    @IsTest
    static void shouldWarnNoFiscalValidityWhenRenderingInvoice() {
        Opportunity donation = loadDonation(recordDonation('notice', DONOR_EMAIL, 'individual'));

        Test.startTest();
        String html = DonationInvoicePdf.html(donation, donation.Invoice_Requests__r[0]);
        Test.stopTest();

        Assert.isTrue(html.contains('sin validez fiscal'), 'States it has no fiscal validity');
        Assert.isTrue(html.contains('No es un CFDI'), 'States it is not a CFDI (RF-F1 CA7)');
    }

    @IsTest
    static void shouldShowLegalEntityWhenCompany() {
        Opportunity donation = loadDonation(recordDonation('company', DONOR_EMAIL, 'company'));

        Test.startTest();
        String html = DonationInvoicePdf.html(donation, donation.Invoice_Requests__r[0]);
        Test.stopTest();

        Assert.isTrue(html.contains('Persona moral'), 'Company donors are a legal entity');
        Assert.isTrue(html.contains('603 - Personas Morales con Fines no Lucrativos'), 'Shows the company regime label');
    }

    @IsTest
    static void shouldReturnPdfWhenRendering() {
        Opportunity donation = loadDonation(recordDonation('pdf', DONOR_EMAIL, 'individual'));

        Test.startTest();
        Blob pdf = DonationInvoicePdf.render(donation, donation.Invoice_Requests__r[0]);
        Test.stopTest();

        Assert.isTrue(pdf.size() > 0, 'The PDF is not empty');
    }

    @IsTest
    static void shouldThrowWhenInvoiceRequestIsMissing() {
        Opportunity donation = loadDonation(recordDonation('missing', null, null));

        Test.startTest();
        try {
            DonationInvoicePdf.render(donation, null);
            Assert.fail('Expected IllegalArgumentException');
        } catch (IllegalArgumentException problem) {
            Assert.isTrue(problem.getMessage().contains('invoice request'), 'Names what is missing');
        }
        Test.stopTest();
    }

    @IsTest
    static void shouldKeepOnlySafeCharactersWhenNamingFile() {
        Assert.areEqual('factura-pi_3Abc123.pdf',
            DonationInvoicePdf.fileName(new Opportunity(Stripe_Payment_Intent_Id__c='pi_3Abc/12<3>')), 'Unsafe characters removed');
        Assert.areEqual('factura-donativo.pdf', DonationInvoicePdf.fileName(new Opportunity()), 'Falls back without a reference');
    }

    // ─── Email ───────────────────────────────────────────────────────────

    @IsTest
    static void shouldAttachPdfAndCopyInvoiceAddressWhenDifferent() {
        Id donationId = recordDonation('attach', INVOICE_EMAIL, 'individual');

        Test.startTest();
        Messaging.SingleEmailMessage email = buildEmail(donationId);
        Test.stopTest();

        Assert.areEqual(1, email.getFileAttachments().size(), 'One invoice attachment');
        Assert.areEqual('factura-pi_attach.pdf', email.getFileAttachments()[0].getFileName(), 'Named after the reference');
        Assert.areEqual('application/pdf', email.getFileAttachments()[0].getContentType(), 'Attached as PDF');
        Assert.areEqual(new List<String>{DONOR_EMAIL}, email.getToAddresses(), 'Still sent to the donor');
        Assert.areEqual(new List<String>{INVOICE_EMAIL}, email.getCcAddresses(), 'The invoice address is copied');
        Assert.isTrue(email.getSubject().startsWith('Recibo y factura'), 'Spanish subject names the invoice');
        Assert.isTrue(email.getHtmlBody().contains('factura simulada'), 'The body mentions the attachment');
    }

    @IsTest
    static void shouldNotCopyWhenInvoiceAddressMatchesDonor() {
        Id donationId = recordDonation('same', DONOR_EMAIL.toUpperCase(), 'individual');

        Test.startTest();
        Messaging.SingleEmailMessage email = buildEmail(donationId);
        Test.stopTest();

        Assert.isNull(email.getCcAddresses(), 'No copy when both addresses are the same, ignoring case');
        Assert.areEqual(1, email.getFileAttachments().size(), 'The invoice is still attached');
    }

    @IsTest
    static void shouldAttachNothingWhenNoInvoiceRequested() {
        Id donationId = recordDonation('plain', null, null);

        Test.startTest();
        Messaging.SingleEmailMessage email = buildEmail(donationId);
        Test.stopTest();

        Assert.isNull(email.getFileAttachments(), 'No invoice without a request (CA3)');
        Assert.isNull(email.getCcAddresses(), 'Nobody is copied');
        Assert.isTrue(email.getSubject().startsWith('Recibo de tu donativo'), 'Receipt-only subject');
        Assert.isFalse(email.getHtmlBody().contains('factura'), 'The body does not mention an invoice');
    }

    // ─── Invoice status ──────────────────────────────────────────────────

    @IsTest
    static void shouldMarkInvoiceSentWhenJobSucceeds() {
        Id donationId = recordDonation('sent', INVOICE_EMAIL, 'individual');
        DonationEmailJob.sender = new RecordingSender();

        Test.startTest();
        System.enqueueJob(new DonationEmailJob(new Set<Id>{donationId}));
        Test.stopTest();

        Invoice_Request__c invoice = loadInvoice(donationId);
        Assert.areEqual('Sent', invoice.Status__c, 'A delivered invoice is Sent');
        Assert.isNotNull(invoice.Sent_At__c, 'The flow stamps the send time');
    }

    @IsTest
    static void shouldMarkInvoiceFailedWhenFinalizerSeesFailure() {
        Id donationId = recordDonation('failed', INVOICE_EMAIL, 'individual');

        Test.startTest();
        new DonationEmailJob.InvoiceStatusFinalizer(new Set<Id>{donationId}).execute(null);
        Test.stopTest();

        Assert.areEqual('Failed', loadInvoice(donationId).Status__c, 'A failed or unknown result is Failed');
    }

    @IsTest
    static void shouldLeaveOtherStatusesWhenMarkingInvoices() {
        Id donationId = recordDonation('kept', INVOICE_EMAIL, 'individual');
        DonationEmailJob.markInvoices(new Set<Id>{donationId}, true);

        Test.startTest();
        DonationEmailJob.markInvoices(new Set<Id>{donationId}, false);
        Test.stopTest();

        Assert.areEqual('Sent', loadInvoice(donationId).Status__c, 'Only pending requests change');
    }
}
