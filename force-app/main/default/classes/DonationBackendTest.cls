@IsTest
private class DonationBackendTest {
    @TestSetup static void setup() {
        Date today = CampaignService.today();
        List<Campaign> items = new List<Campaign>();
        for (Integer i = 0; i < 3; i++) {
            items.add(new Campaign(Name='Backend test ' + i, IsActive=false, Description='Fictitious campaign',
                Purpose__c='Academic testing', Image_Url__c='https://example.com/test.png', ExpectedRevenue=1000,
                StartDate=today.addDays(i == 2 ? 1 : -10), EndDate=today.addDays(i == 1 ? -1 : 10)));
            // Compatibility with pre-existing class-sandbox campaign visibility validation.
            Map<String, Schema.SObjectField> fields = Campaign.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).fields.getMap();
            if (fields.containsKey('Visibility_Start_Date__c')) {
                items[i].put('Visibility_Start_Date__c', items[i].StartDate);
                items[i].put('Visibility_End_Date__c', items[i].EndDate);
            }
        }
        // The shared teaching sandbox's legacy OpportunityTrigger requires this campaign.
        Map<String, Schema.SObjectField> campaignFields = Campaign.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).fields.getMap();
        if (campaignFields.containsKey('Total_money_raised_without_commission__c')) {
            Campaign legacyFund = new Campaign(Name='FONDOS SDU', IsActive=false, Description='Legacy test dependency',
                Purpose__c='Test only', Image_Url__c='https://example.com/test.png', ExpectedRevenue=1000,
                StartDate=today.addDays(1), EndDate=today.addDays(10));
            legacyFund.put('Total_money_raised_without_commission__c',0);
            items.add(legacyFund);
        }
        insert as system items;
    }
    private static Campaign campaign(Integer index) {
        String name = 'Backend test ' + index;
        return [SELECT Id FROM Campaign WHERE Name=:name WITH SYSTEM_MODE LIMIT 1];
    }
    private static Map<String, Object> request(Id campaignId) {
        return new Map<String, Object>{'campaignId'=>String.valueOf(campaignId), 'amount'=>250,
            'donorEmail'=>'fictitious@example.com', 'isAnonymous'=>false, 'publicName'=>'Example Donor'};
    }
    private static Map<String, Object> invoice(Boolean company) {
        return new Map<String, Object>{'fullName'=>'Example Legal Name', 'rfc'=>company ? 'AAA010101AAA' : 'AAAA010101AAA',
            'taxpayerType'=>company ? 'company' : 'individual', 'postalCode'=>'97000', 'taxRegime'=>'612',
            'cfdiUse'=>'D04', 'email'=>'invoice@example.com'};
    }
    private static String event(Map<String, Object> input, String eventId, String paymentId) {
        return JSON.serialize(new Map<String, Object>{'id'=>eventId, 'type'=>'payment_intent.succeeded', 'livemode'=>false,
            'data'=>new Map<String, Object>{'object'=>new Map<String, Object>{'id'=>paymentId, 'currency'=>'mxn',
                'status'=>'succeeded', 'amount_received'=>25000, 'metadata'=>PaymentSessionService.buildMetadata(input)}}});
    }
    private static void rest(String uri, String body) {
        RestContext.request = new RestRequest(); RestContext.response = new RestResponse();
        RestContext.request.requestURI = '/services/apexrest/donations/v1/' + uri;
        if (body != null) { RestContext.request.requestBody=Blob.valueOf(body); }
    }
    @IsTest static void healthAndCampaignRoutes() {
        rest('health', null); HealthResource.ping(); System.assertEquals(200, RestContext.response.statusCode);
        HealthResource.pingPost();
        rest('campaigns', null); CampaignsResource.getCampaigns();
        Map<String, Object> body=(Map<String, Object>)JSON.deserializeUntyped(RestContext.response.responseBody.toString());
        System.assertEquals(1, ((List<Object>)body.get('campaigns')).size());
        RestContext.request.params.put('status', 'completed'); CampaignsResource.getCampaigns();
        System.assert(RestContext.response.responseBody.toString().contains('Backend test 1'));
        RestContext.request.params.put('status', 'invalid'); CampaignsResource.getCampaigns(); System.assertEquals(400, RestContext.response.statusCode);
        rest('campaigns/' + campaign(2).Id, null); CampaignsResource.getCampaigns(); System.assertEquals(404, RestContext.response.statusCode);
        rest('campaigns/not-an-id', null); CampaignsResource.getCampaigns(); System.assertEquals(404, RestContext.response.statusCode);
        rest('campaigns/' + campaign(0).Id, null); CampaignsResource.getCampaigns(); System.assertEquals(200, RestContext.response.statusCode);
    }
    @IsTest static void sessionsNeverWriteDonations() {
        Map<String, Object> input=request(campaign(0).Id); input.put('invoice', invoice(false));
        rest('payment-sessions', JSON.serialize(input)); PaymentSessionsResource.createSession();
        System.assertEquals(200, RestContext.response.statusCode);
        System.assert(RestContext.response.responseBody.toString().contains('pi_mock_'));
        System.assertEquals(0, [SELECT count() FROM Opportunity]);
        input.put('campaignId', String.valueOf(campaign(1).Id));
        rest('payment-sessions',JSON.serialize(input)); PaymentSessionsResource.createSession(); System.assertEquals(409,RestContext.response.statusCode);
        rest('payment-sessions','{'); PaymentSessionsResource.createSession(); System.assertEquals(400,RestContext.response.statusCode);
        rest('payment-sessions','[]'); PaymentSessionsResource.createSession(); System.assertEquals(400,RestContext.response.statusCode);
        rest('payment-sessions','null'); PaymentSessionsResource.createSession(); System.assertEquals(400,RestContext.response.statusCode);
    }
    @IsTest static void validationFailures() {
        Map<String, Object> input=request(campaign(0).Id);
        input.put('amount',49.001); input.put('donorEmail','invalid'); input.put('isAnonymous',true);
        Map<String,Object> tax=invoice(false); tax.put('rfc','bad'); tax.put('postalCode','abc'); tax.put('taxRegime','999');
        tax.put('cfdiUse','bad'); tax.put('taxpayerType','invalid'); tax.put('fullName',12); tax.put('email',null); input.put('invoice',tax);
        try { PaymentSessionValidator.validate(input); System.assert(false); }
        catch(ApiException problem) { System.assert(problem.fields.size() >= 9); }
        for (String body : new List<String>{'{}','{"amount":"250","isAnonymous":"false","invoice":[]}',
            '{"amount":250,"isAnonymous":false,"publicName":"spam"}'}) {
            rest('payment-sessions',body); PaymentSessionsResource.createSession(); System.assertEquals(400,RestContext.response.statusCode);
        }
        input=request(campaign(0).Id); input.put('publicName','x'.repeat(81));
        try { PaymentSessionValidator.validate(input); System.assert(false); } catch(ApiException problem) { System.assert(!problem.fields.isEmpty()); }
    }
    @IsTest static void recordsOnceAndProtectsPublicData() {
        Map<String,Object> input=request(campaign(0).Id); input.put('invoice',invoice(false));
        String sample=event(input,'evt_backend_1','pi_backend_1');
        DonationRecorder.Result result=DonationRecorder.recordVerifiedEvent(sample);
        System.assertEquals(false,result.duplicate);
        System.assertEquals(true,DonationRecorder.recordVerifiedEvent(sample).duplicate);
        System.assertEquals(true,DonationRecorder.recordVerifiedEvent(event(input,'evt_backend_2','pi_backend_1')).duplicate);
        System.assertEquals(1,[SELECT count() FROM Opportunity]);
        System.assertEquals(1,[SELECT count() FROM Invoice_Request__c]);
        System.assertEquals(1,[SELECT count() FROM OpportunityContactRole]);
        Opportunity donation=[SELECT Amount,IsWon,Display_Status__c FROM Opportunity LIMIT 1];
        System.assertEquals(250,donation.Amount); System.assertEquals(true,donation.IsWon);
        rest('campaigns/' + campaign(0).Id,null); CampaignsResource.getCampaigns();
        String response=RestContext.response.responseBody.toString();
        System.assert(response.contains('Example Donor'), response);
        System.assert(!response.contains('fictitious@example.com'), 'Donor email must remain private.');
        System.assert(!response.contains('invoice@example.com'), 'Invoice email must remain private.');
        System.assert(!response.contains('AAAA010101AAA'), 'RFC must remain private.');
        donation.Display_Status__c='Hidden'; update as system donation;
        CampaignsResource.getCampaigns(); System.assert(!RestContext.response.responseBody.toString().contains('Example Donor'));
    }
    @IsTest static void anonymousCompanyAndExistingDonor() {
        Map<String,Object> input=request(campaign(0).Id); input.put('isAnonymous',true); input.remove('publicName'); input.put('invoice',invoice(true));
        DonationRecorder.recordVerifiedEvent(event(input,'evt_company_1','pi_company_1'));
        DonationRecorder.recordVerifiedEvent(event(input,'evt_company_2','pi_company_2'));
        System.assertEquals(1,[SELECT count() FROM Contact WHERE Email='fictitious@example.com']);
        System.assertEquals(2,[SELECT count() FROM Opportunity]);
        System.assertEquals(2,[SELECT count() FROM Invoice_Request__c WHERE Taxpayer_Type__c='Company']);
        System.assertEquals(0,PublicCampaignSelector.supporters(campaign(0).Id).size());
    }
    @IsTest static void invalidEventsDoNotWrite() {
        String sample=event(request(campaign(0).Id),'evt_bad_1','pi_bad_1');
        for (String bad : new List<String>{sample.replace('payment_intent.succeeded','payment_intent.payment_failed'),
            sample.replace('"livemode":false','"livemode":true'),sample.replace('"mxn"','"usd"'),
            sample.replace('"schema_version":"1"','"schema_version":"2"'),sample.replace('25000','100')}) {
            try { DonationRecorder.recordVerifiedEvent(bad); System.assert(false); } catch(Exception expected) { System.assert(!(expected instanceof AssertException)); }
        }
        System.assertEquals(0,[SELECT count() FROM Opportunity]);
    }
    @IsTest static void unexpectedFailuresAreSanitized() {
        rest('health',null); ApiResponse.fail(new TypeException('private detail'));
        System.assertEquals(500,RestContext.response.statusCode);
        System.assert(!RestContext.response.responseBody.toString().contains('private detail'));
    }
    @IsTest static void recordingFailureRollsBackAllRecords() {
        Map<String,Object> input=request(campaign(0).Id); input.put('invoice',invoice(false));
        String sample=event(input,'evt_' + 'x'.repeat(300),'pi_rollback');
        Boolean failed=false;
        try { DonationRecorder.recordVerifiedEvent(sample); } catch(DmlException expected) { failed=true; }
        System.assert(failed, 'An overlong event ID must fail the final event-log insert.');
        System.assertEquals(0,[SELECT count() FROM Opportunity]);
        System.assertEquals(0,[SELECT count() FROM Invoice_Request__c]);
        System.assertEquals(0,[SELECT count() FROM Contact WHERE Email='fictitious@example.com']);
        System.assertEquals(0,[SELECT count() FROM Stripe_Event__c]);
    }
    @IsTest static void anonymousWithoutInvoiceAndLateSettlement() {
        Map<String,Object> input=request(campaign(1).Id); input.put('isAnonymous',true); input.remove('publicName');
        DonationRecorder.recordVerifiedEvent(event(input,'evt_late','pi_late'));
        System.assertEquals(1,[SELECT count() FROM Opportunity]);
        System.assertEquals(0,[SELECT count() FROM Invoice_Request__c]);
        System.assertEquals(0,PublicCampaignSelector.supporters(campaign(1).Id).size());
    }
    @IsTest static void sampleFixtureAndGuestAccess() {
        String raw = event(request(campaign(0).Id),'evt_guest_sample','pi_guest_sample');
        DonationRecorder.Result result = DonationRecorder.recordVerifiedEvent(raw);
        System.assertNotEquals(null,result.opportunityId);
        User guest = [SELECT Id FROM User WHERE UserType='Guest' AND Profile.Name='donations Perfil' LIMIT 1];
        Id campaignId=campaign(0).Id;
        System.runAs(guest) {
            rest('campaigns/' + campaignId,null); CampaignsResource.getCampaigns();
            System.assertEquals(200,RestContext.response.statusCode);
            System.assert(!RestContext.response.responseBody.toString().contains('fictitious@example.com'));
            rest('payment-sessions',JSON.serialize(request(campaignId))); PaymentSessionsResource.createSession();
            System.assertEquals(200,RestContext.response.statusCode);
        }
    }
    @IsTest static void guestCannotDirectlyReadWriteOrCreateDonations() {
        DonationRecorder.Result recorded=DonationRecorder.recordVerifiedEvent(event(request(campaign(0).Id),'evt_isolation','pi_isolation'));
        User guest=[SELECT Id FROM User WHERE UserType='Guest' AND Profile.Name='donations Perfil' LIMIT 1];
        System.runAs(guest) {
            Boolean readDenied=false;
            try { List<Opportunity> rows=[SELECT Id,Amount FROM Opportunity WHERE Id=:recorded.opportunityId WITH USER_MODE]; }
            catch(Exception expected) { readDenied=expected instanceof QueryException || expected instanceof SecurityException; }
            System.assert(readDenied,'User-mode guest reads must be denied even when the record exists.');
            Boolean updateDenied=false;
            try { Opportunity change=new Opportunity(Id=recorded.opportunityId,Amount=1); update as user change; }
            catch(Exception expected) { updateDenied=expected instanceof DmlException || expected instanceof SecurityException; }
            System.assert(updateDenied,'Guest cannot change another donor record.');
            Boolean createDenied=false;
            try { Opportunity fake=new Opportunity(Name='Forged donation',Amount=250,StageName='Closed Won',CloseDate=Date.today()); insert as user fake; }
            catch(Exception expected) { createDenied=expected instanceof DmlException || expected instanceof SecurityException; }
            System.assert(createDenied,'Guest cannot create a donation without payment.');
        }
        System.assertEquals(250,[SELECT Amount FROM Opportunity WHERE Id=:recorded.opportunityId WITH SYSTEM_MODE].Amount);
    }
}
