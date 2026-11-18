/**
 * Tests the donation receipt (RF-D5): content for credited and anonymous donors, when nothing is sent,
 * sanitized failures, and that only newly recorded website donations queue a receipt.
 * A fake sender replaces Salesforce email, so the tests do not depend on the org's deliverability.
 */
@IsTest
private class DonationEmailJobTest {
    private static final String TEST_SECRET = 'fictitious-unit-test-key';
    private static final String CAMPAIGN_NAME = 'Receipt test campaign';
    private static final String DONOR_EMAIL = 'receipt.test@example.com';
    private static final String PUBLIC_NAME = 'Prueba Álvarez';
    private static final Integer BULK_SIZE = 251;

    private class RecordingSender implements DonationEmailJob.Sender {
        public List<Messaging.SingleEmailMessage> sent = new List<Messaging.SingleEmailMessage>();
        public void send(List<Messaging.SingleEmailMessage> messages) { sent.addAll(messages); }
    }

    private class FailingSender implements DonationEmailJob.Sender {
        public void send(List<Messaging.SingleEmailMessage> messages) {
            throw new EmailException('INVALID_EMAIL_ADDRESS: ' + DONOR_EMAIL);
        }
    }

    private class ReportingSender implements DonationEmailJob.Sender {
        public void send(List<Messaging.SingleEmailMessage> messages) {
            throw new DonationEmailJob.DonationEmailException('1 of 1 donation emails failed.');
        }
    }

    @TestSetup
    static void setup() {
        insert new Stripe_Settings__c(SetupOwnerId=UserInfo.getOrganizationId(), Webhook_Secret__c=TEST_SECRET);
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

    private static Id campaignId() {
        return [SELECT Id FROM Campaign WHERE Name = :CAMPAIGN_NAME WITH SYSTEM_MODE LIMIT 1].Id;
    }

    private static String event(String eventId, String paymentId, String type, Boolean anonymous) {
        Map<String, Object> input = new Map<String, Object>{'campaignId'=>campaignId(), 'amount'=>1250.5,
            'donorEmail'=>DONOR_EMAIL, 'isAnonymous'=>anonymous};
        if (!anonymous) { input.put('publicName', PUBLIC_NAME); }
        return JSON.serialize(new Map<String, Object>{'id'=>eventId, 'type'=>type, 'livemode'=>false,
            'data'=>new Map<String, Object>{'object'=>new Map<String, Object>{'id'=>paymentId, 'livemode'=>false,
                'status'=>type == 'payment_intent.succeeded' ? 'succeeded' : 'requires_payment_method',
                'currency'=>'mxn', 'amount_received'=>125050, 'metadata'=>PaymentSessionService.buildMetadata(input)}}});
    }

    private static Id recordDonation(String suffix, Boolean anonymous) {
        return DonationRecorder.recordVerifiedEvent(
            event('evt_' + suffix, 'pi_' + suffix, 'payment_intent.succeeded', anonymous)).opportunityId;
    }

    private static void deliverSigned(String body) {
        Long timestamp = System.now().getTime() / 1000;
        String signature = 't=' + timestamp + ',v1=' + EncodingUtil.convertToHex(Crypto.generateMac('hmacSHA256',
            Blob.valueOf(timestamp + '.' + body), Blob.valueOf(TEST_SECRET)));
        RestContext.request = new RestRequest(); RestContext.response = new RestResponse();
        RestContext.request.requestURI = '/services/apexrest/donations/v1/webhooks/stripe';
        RestContext.request.httpMethod = 'POST'; RestContext.request.requestBody = Blob.valueOf(body);
        RestContext.request.addHeader('Stripe-Signature', signature);
        StripeWebhookResource.receive();
    }

    private static RecordingSender useRecordingSender() {
        RecordingSender fake = new RecordingSender();
        DonationEmailJob.sender = fake;
        return fake;
    }

    // ─── Receipt content ─────────────────────────────────────────────────

    @IsTest
    static void shouldBuildSpanishReceiptWithNameWhenCredited() {
        Id donationId = recordDonation('credited', false);

        Test.startTest();
        List<Messaging.SingleEmailMessage> receipts = DonationReceiptEmail.build(new Set<Id>{donationId});
        Test.stopTest();

        Assert.areEqual(1, receipts.size(), 'A credited donation gets one receipt');
        Messaging.SingleEmailMessage receipt = receipts[0];
        Assert.areEqual(new List<String>{DONOR_EMAIL}, receipt.getToAddresses(), 'The receipt goes to the donor address');
        Assert.isNull(receipt.getTargetObjectId(), 'No target object: the guest cannot access Contacts');
        Assert.areEqual('Recibo de tu donativo a ' + CAMPAIGN_NAME, receipt.getSubject(), 'Spanish subject with the campaign');
        Assert.isFalse(receipt.getSaveAsActivity(), 'The guest cannot create activities');
        Assert.isTrue(receipt.getHtmlBody().contains('¡Gracias por tu donativo!'), 'Spanish greeting');
        Assert.isTrue(receipt.getHtmlBody().contains('pi_credited'), 'Shows the payment reference');
        Assert.isTrue(receipt.getHtmlBody().contains('$1,250.50 MXN'), 'Shows the amount');
        Assert.isTrue(receipt.getHtmlBody().contains(PUBLIC_NAME.escapeHtml4()), 'Credited donors see their display name');
        Assert.isTrue(receipt.getPlainTextBody().contains('Nombre público: ' + PUBLIC_NAME), 'Plain text has the name too');
    }

    @IsTest
    static void shouldBuildReceiptToAddressWhenRunningAsSiteGuest() {
        Id donationId = recordDonation('guest', true);
        User guest = [SELECT Id FROM User WHERE UserType = 'Guest' AND Profile.Name = 'donations Perfil' WITH SYSTEM_MODE LIMIT 1];
        RecordingSender fake = useRecordingSender();

        Test.startTest();
        System.runAs(guest) {
            new DonationEmailJob(new Set<Id>{donationId}).execute(null);
        }
        Test.stopTest();

        Assert.areEqual(1, fake.sent.size(), 'The guest context still builds the receipt');
        Assert.areEqual(new List<String>{DONOR_EMAIL}, fake.sent[0].getToAddresses(), 'Sent to the donor address');
        Assert.isNull(fake.sent[0].getTargetObjectId(), 'No Contact target, which the guest cannot access');
    }

    @IsTest
    static void shouldOmitDisplayNameWhenAnonymous() {
        Id donationId = recordDonation('anonymous', true);

        Test.startTest();
        List<Messaging.SingleEmailMessage> receipts = DonationReceiptEmail.build(new Set<Id>{donationId});
        Test.stopTest();

        Assert.areEqual(1, receipts.size(), 'An anonymous donation still gets a receipt');
        Assert.isFalse(receipts[0].getHtmlBody().contains('Nombre público'), 'No display name row for anonymous donors');
        Assert.isFalse(receipts[0].getPlainTextBody().contains('Nombre público'), 'No display name in plain text');
    }

    @IsTest
    static void shouldUseProgramNameWhenNoSenderAddressConfigured() {
        Id donationId = recordDonation('sender', true);

        Test.startTest();
        Messaging.SingleEmailMessage receipt = DonationReceiptEmail.build(new Set<Id>{donationId})[0];
        Test.stopTest();

        Assert.areEqual('Mexico Dreamin', receipt.getSenderDisplayName(), 'Falls back to the program name');
        Assert.isNull(receipt.getOrgWideEmailAddressId(), 'No org-wide address is used when none is configured');
    }

    @IsTest
    static void shouldBuildNothingWhenIdsAreNull() {
        Test.startTest();
        List<Messaging.SingleEmailMessage> receipts = DonationReceiptEmail.build(null);
        Test.stopTest();
        Assert.areEqual(0, receipts.size(), 'Null input builds no receipt');
    }

    @IsTest
    static void shouldBuildNothingWhenIdsAreEmpty() {
        Test.startTest();
        List<Messaging.SingleEmailMessage> receipts = DonationReceiptEmail.build(new Set<Id>());
        Test.stopTest();
        Assert.areEqual(0, receipts.size(), 'Empty input builds no receipt');
    }

    @IsTest
    static void shouldSkipDonationWhenEnteredManually() {
        Opportunity manual = new Opportunity(Name='Manual donation', StageName='Closed Won', CloseDate=CampaignService.today(),
            CampaignId=campaignId(), Amount=100, Source__c='Manual');
        insert as system manual;

        Test.startTest();
        List<Messaging.SingleEmailMessage> receipts = DonationReceiptEmail.build(new Set<Id>{manual.Id});
        Test.stopTest();

        Assert.areEqual(0, receipts.size(), 'Manual donations send no email (RF-S3)');
    }

    @IsTest
    static void shouldSkipDonationWhenNoDonorContact() {
        Opportunity orphan = new Opportunity(Name='Website donation', StageName='Closed Won', CloseDate=CampaignService.today(),
            CampaignId=campaignId(), Amount=100, Source__c='Website', Stripe_Payment_Intent_Id__c='pi_orphan');
        insert as system orphan;

        Test.startTest();
        List<Messaging.SingleEmailMessage> receipts = DonationReceiptEmail.build(new Set<Id>{orphan.Id});
        Test.stopTest();

        Assert.areEqual(0, receipts.size(), 'Without a donor address there is nobody to send to');
    }

    @IsTest
    static void shouldBuildOneReceiptPerDonationWhenBulk() {
        Id campaign = campaignId();
        List<Contact> donors = new List<Contact>();
        List<Opportunity> donations = new List<Opportunity>();
        for (Integer index = 0; index < BULK_SIZE; index++) {
            donors.add(new Contact(LastName='Bulk donor ' + index, Email='bulk' + index + '@example.com'));
            donations.add(new Opportunity(Name='Bulk donation ' + index, StageName='Closed Won',
                CloseDate=CampaignService.today(), CampaignId=campaign, Amount=50, Source__c='Website',
                Is_Anonymous__c=true, Stripe_Payment_Intent_Id__c='pi_bulk_' + index));
        }
        insert as system donors;
        insert as system donations;
        List<OpportunityContactRole> roles = new List<OpportunityContactRole>();
        for (Integer index = 0; index < BULK_SIZE; index++) {
            roles.add(new OpportunityContactRole(OpportunityId=donations[index].Id, ContactId=donors[index].Id, IsPrimary=true));
        }
        insert as system roles;

        Test.startTest();
        List<Messaging.SingleEmailMessage> receipts = DonationReceiptEmail.build(new Map<Id, Opportunity>(donations).keySet());
        Test.stopTest();

        Assert.areEqual(BULK_SIZE, receipts.size(), 'Every bulk donation gets exactly one receipt');
    }

    // ─── Formatting ──────────────────────────────────────────────────────

    @IsTest
    static void shouldGroupThousandsWhenFormattingAmount() {
        Assert.areEqual('$1,250.50 MXN', DonationReceiptEmail.formatAmount(1250.5), 'Thousands and two decimals');
        Assert.areEqual('$20,000.00 MXN', DonationReceiptEmail.formatAmount(20000), 'Whole amounts keep two decimals');
        Assert.areEqual('$50.00 MXN', DonationReceiptEmail.formatAmount(50), 'Minimum amount');
    }

    @IsTest
    static void shouldFormatDayMonthYearWhenFormattingDate() {
        Assert.areEqual('07/11/2026', DonationReceiptEmail.formatDate(Date.newInstance(2026, 11, 7)), 'dd/MM/yyyy');
        Assert.areEqual('', DonationReceiptEmail.formatDate(null), 'Null date is empty');
    }

    // ─── Job ─────────────────────────────────────────────────────────────

    @IsTest
    static void shouldSendReceiptWhenJobRuns() {
        Id donationId = recordDonation('job', false);
        RecordingSender fake = useRecordingSender();

        Test.startTest();
        System.enqueueJob(new DonationEmailJob(new Set<Id>{donationId}));
        Test.stopTest();

        Assert.areEqual(1, fake.sent.size(), 'The job sends one receipt');
    }

    @IsTest
    static void shouldSendNothingWhenJobHasNoDonations() {
        RecordingSender fake = useRecordingSender();

        Test.startTest();
        new DonationEmailJob(null).execute(null);
        Test.stopTest();

        Assert.areEqual(0, fake.sent.size(), 'No donations, no email');
    }

    @IsTest
    static void shouldThrowSanitizedErrorWhenSendingFails() {
        Id donationId = recordDonation('failing', true);
        DonationEmailJob.sender = new FailingSender();

        Test.startTest();
        try {
            new DonationEmailJob(new Set<Id>{donationId}).execute(null);
            Assert.fail('Expected DonationEmailException');
        } catch (DonationEmailJob.DonationEmailException problem) {
            Assert.isFalse(problem.getMessage().contains(DONOR_EMAIL), 'The job error names no address');
            Assert.isNotNull(problem.getCause(), 'The original cause is kept for admins');
        }
        Test.stopTest();
    }

    @IsTest
    static void shouldKeepSanitizedErrorWhenSenderReportsFailures() {
        Id donationId = recordDonation('reported', true);
        DonationEmailJob.sender = new ReportingSender();

        Test.startTest();
        try {
            new DonationEmailJob(new Set<Id>{donationId}).execute(null);
            Assert.fail('Expected DonationEmailException');
        } catch (DonationEmailJob.DonationEmailException problem) {
            Assert.areEqual('1 of 1 donation emails failed.', problem.getMessage(), 'The count is kept as is');
        }
        Test.stopTest();
    }

    @IsTest
    static void shouldAcceptOutcomesWhenAllSent() {
        Test.startTest();
        DonationEmailJob.requireAllSent(new List<String>(), 2);
        Test.stopTest();
        Assert.isTrue(true, 'All accepted outcomes raise no error');
    }

    @IsTest
    static void shouldCountFailuresWhenSomeNotSent() {
        Test.startTest();
        try {
            DonationEmailJob.requireAllSent(new List<String>{'INVALID_EMAIL_ADDRESS', 'INVALID_EMAIL_ADDRESS'}, 3);
            Assert.fail('Expected DonationEmailException');
        } catch (DonationEmailJob.DonationEmailException problem) {
            Assert.areEqual('2 of 3 donation emails failed: INVALID_EMAIL_ADDRESS.', problem.getMessage(),
                'Counts failures and names the status code, without personal data');
        }
        Test.stopTest();
    }

    @IsTest
    static void shouldSendOrRefuseCleanlyWhenUsingPlatformEmail() {
        // Smoke test of the real sender. Whether it sends depends on the org's deliverability setting,
        // so it asserts only that a refusal surfaces as an email error, never as something else.
        Id donationId = recordDonation('platform', true);
        List<Messaging.SingleEmailMessage> receipts = DonationReceiptEmail.build(new Set<Id>{donationId});

        Test.startTest();
        String outcome = 'sent';
        try {
            new DonationEmailJob.PlatformSender().send(receipts);
        } catch (EmailException refused) {
            outcome = 'refused';
        } catch (NoAccessException refused) {
            outcome = 'refused';
        }
        Test.stopTest();

        Assert.isTrue(new Set<String>{'sent', 'refused'}.contains(outcome), 'The real sender either sends or refuses');
    }

    // ─── Webhook ─────────────────────────────────────────────────────────

    @IsTest
    static void shouldQueueOneReceiptWhenNoticeIsRepeated() {
        RecordingSender fake = useRecordingSender();
        String raw = event('evt_webhook', 'pi_webhook', 'payment_intent.succeeded', false);

        Test.startTest();
        deliverSigned(raw);
        deliverSigned(raw);
        deliverSigned(event('evt_webhook_retry', 'pi_webhook', 'payment_intent.succeeded', false));
        Integer queued = Limits.getQueueableJobs();
        Test.stopTest();

        Assert.areEqual(200, RestContext.response.statusCode, 'Repeats are acknowledged');
        Assert.areEqual(1, queued, 'Only the first notice queues a receipt');
        Assert.areEqual(1, fake.sent.size(), 'The donor receives a single receipt');
    }

    @IsTest
    static void shouldQueueNoReceiptWhenPaymentFails() {
        RecordingSender fake = useRecordingSender();

        Test.startTest();
        deliverSigned(event('evt_declined', 'pi_declined', 'payment_intent.payment_failed', true));
        Integer queued = Limits.getQueueableJobs();
        Test.stopTest();

        Assert.areEqual(200, RestContext.response.statusCode, 'Failed payments are acknowledged');
        Assert.areEqual(0, queued, 'A failed payment queues no receipt');
        Assert.areEqual(0, fake.sent.size(), 'No receipt for a failed payment');
    }
}
