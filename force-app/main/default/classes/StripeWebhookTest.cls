@IsTest
private class StripeWebhookTest {
    private static final String TEST_SECRET = 'fictitious-unit-test-key';
    @TestSetup static void setup() {
        insert new Stripe_Settings__c(SetupOwnerId=UserInfo.getOrganizationId(), Webhook_Secret__c=TEST_SECRET);
        Date today = CampaignService.today();
        Campaign item = new Campaign(Name='Webhook test campaign', Description='Fictitious test campaign',
            Purpose__c='Academic test', Image_Url__c='https://example.com/test.png', ExpectedRevenue=1000,
            StartDate=today.addDays(-1), EndDate=today.addDays(1));
        Map<String, Schema.SObjectField> fields = Campaign.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).fields.getMap();
        if (fields.containsKey('Visibility_Start_Date__c')) {
            item.put('Visibility_Start_Date__c', item.StartDate); item.put('Visibility_End_Date__c', item.EndDate);
        }
        List<Campaign> campaigns = new List<Campaign>{item};
        if (fields.containsKey('Total_money_raised_without_commission__c')) {
            Campaign legacy = item.clone(false, false, false, false);
            legacy.Name='FONDOS SDU'; legacy.StartDate=today.addDays(1); legacy.EndDate=today.addDays(10);
            if (fields.containsKey('Visibility_Start_Date__c')) {
                legacy.put('Visibility_Start_Date__c', legacy.StartDate); legacy.put('Visibility_End_Date__c', legacy.EndDate);
            }
            legacy.put('Total_money_raised_without_commission__c', 0); campaigns.add(legacy);
        }
        insert as system campaigns;
    }
    private static Id campaignId() {
        return [SELECT Id FROM Campaign WHERE Name='Webhook test campaign' WITH SYSTEM_MODE LIMIT 1].Id;
    }
    private static String event(String eventId, String paymentId, String type, Boolean anonymous) {
        Map<String, Object> input = new Map<String, Object>{'campaignId'=>campaignId(), 'amount'=>250,
            'donorEmail'=>'test@example.com', 'isAnonymous'=>anonymous};
        if (!anonymous) { input.put('publicName', 'Prueba Álvarez'); }
        return JSON.serialize(new Map<String, Object>{'id'=>eventId, 'type'=>type, 'livemode'=>false,
            'data'=>new Map<String, Object>{'object'=>new Map<String, Object>{'id'=>paymentId, 'livemode'=>false,
                'status'=>type == 'payment_intent.succeeded' ? 'succeeded' : 'requires_payment_method',
                'currency'=>'mxn', 'amount_received'=>25000, 'metadata'=>PaymentSessionService.buildMetadata(input)}}});
    }
    private static String signature(String body, Long timestamp) {
        return 't=' + timestamp + ',v1=' + EncodingUtil.convertToHex(Crypto.generateMac('hmacSHA256',
            Blob.valueOf(timestamp + '.' + body), Blob.valueOf(TEST_SECRET)));
    }
    private static void deliver(String body, String headerName, String header) {
        RestContext.request=new RestRequest(); RestContext.response=new RestResponse();
        RestContext.request.requestURI='/services/apexrest/donations/v1/webhooks/stripe';
        RestContext.request.httpMethod='POST'; RestContext.request.requestBody=Blob.valueOf(body);
        if (header != null) { RestContext.request.addHeader(headerName, header); }
        StripeWebhookResource.receive();
    }
    private static void deliverSigned(String body) {
        deliver(body, 'stripe-signature', signature(body, System.now().getTime()/1000));
    }
    @IsTest static void rejectsForgeryBeforeParsingAndCannotPoisonEventId() {
        String raw=event('evt_forged', 'pi_forged', 'payment_intent.succeeded', true);
        deliver(raw, 'Stripe-Signature', null);
        System.assertEquals(400, RestContext.response.statusCode);
        Stripe_Event__c rejection=[SELECT Stripe_Event_Id__c, Reason__c, Opportunity__c FROM Stripe_Event__c LIMIT 1];
        System.assert(rejection.Stripe_Event_Id__c.startsWith('rejected_'));
        System.assertEquals(null, rejection.Opportunity__c);
        System.assertEquals(0, [SELECT count() FROM Opportunity]);
        deliverSigned(raw);
        System.assertEquals(200, RestContext.response.statusCode, RestContext.response.responseBody.toString());
        System.assertEquals(1, [SELECT count() FROM Opportunity]);
    }
    @IsTest static void recordsOnceAcrossEventAndPaymentRetries() {
        String raw=event('evt_once', 'pi_once', 'payment_intent.succeeded', false);
        Test.startTest(); deliverSigned(raw); deliverSigned(raw);
        deliverSigned(event('evt_other_delivery', 'pi_once', 'payment_intent.succeeded', false)); Test.stopTest();
        System.assertEquals(200, RestContext.response.statusCode);
        System.assertEquals('{"received":true}', RestContext.response.responseBody.toString());
        System.assertEquals(1, [SELECT count() FROM Opportunity]);
        System.assertEquals(2, [SELECT count() FROM Stripe_Event__c]);
        System.assertEquals(1, [SELECT count() FROM Stripe_Event__c WHERE Status__c='Duplicate']);
        Opportunity donation=[SELECT Amount, IsWon FROM Opportunity LIMIT 1];
        System.assertEquals(250, donation.Amount); System.assertEquals(true, donation.IsWon);
        System.assertEquals(250, CampaignService.requireCampaign(String.valueOf(campaignId()), false).get('AmountWonOpportunities'));
    }
    @IsTest static void unsuccessfulAndUnsupportedEventsNeverCreateDonations() {
        deliverSigned(event('evt_failed', 'pi_failed', 'payment_intent.payment_failed', true));
        System.assertEquals(200, RestContext.response.statusCode);
        deliverSigned(event('evt_canceled', 'pi_canceled', 'payment_intent.canceled', true));
        System.assertEquals(200, RestContext.response.statusCode);
        deliverSigned('{"id":"evt_ignored","type":"customer.created","livemode":false}');
        System.assertEquals(200, RestContext.response.statusCode);
        System.assertEquals(3, [SELECT count() FROM Stripe_Event__c WHERE Opportunity__c=null]);
        System.assertEquals(0, [SELECT count() FROM Opportunity]); System.assertEquals(0, [SELECT count() FROM Contact]);
    }
    @IsTest static void rejectsBadBodiesLiveModeAndStaleSignatures() {
        String raw=event('evt_invalid', 'pi_invalid', 'payment_intent.succeeded', true);
        List<String> badBodies=new List<String>{'not-json','null','[]','{}', raw.replace('"livemode":false','"livemode":true'),
            '{"id":"evt_missing","type":"payment_intent.succeeded","livemode":false}'};
        for (String body : badBodies) { deliverSigned(body); System.assertEquals(400, RestContext.response.statusCode); }
        deliver(raw, 'STRIPE-SIGNATURE', signature(raw, System.now().getTime()/1000 - 301));
        System.assertEquals(400, RestContext.response.statusCode);
        deliver(raw, 'Stripe-Signature', signature(raw, System.now().getTime()/1000 + 301));
        System.assertEquals(400, RestContext.response.statusCode);
        deliver(raw+' ', 'Stripe-Signature', signature(raw, System.now().getTime()/1000));
        System.assertEquals(400, RestContext.response.statusCode);
        System.assertEquals(0, [SELECT count() FROM Opportunity]);
    }
    @IsTest static void recordingFailuresStayRetryableAndSanitized() {
        String raw=event('evt_retryable', 'pi_retryable', 'payment_intent.succeeded', true);
        deliverSigned(raw.replace('"schema_version":"1"', '"schema_version":"2"'));
        System.assertEquals(500, RestContext.response.statusCode);
        System.assert(!RestContext.response.responseBody.toString().contains('metadata'));
        System.assertEquals(0, [SELECT count() FROM Opportunity]);
        System.assertEquals(0, [SELECT count() FROM Contact]);
        deliverSigned(raw);
        System.assertEquals(200, RestContext.response.statusCode);
        System.assertEquals(1, [SELECT count() FROM Opportunity]);
    }
    @IsTest static void missingConfigurationFailsClosed() {
        Stripe_Settings__c settings=Stripe_Settings__c.getOrgDefaults(); settings.Webhook_Secret__c=null; update settings;
        deliver('{}', 'Stripe-Signature', null);
        System.assertEquals(503, RestContext.response.statusCode);
        System.assertEquals(0, [SELECT count() FROM Opportunity]);
        System.assert(!RestContext.response.responseBody.toString().contains(TEST_SECRET));
    }
    @IsTest static void guestCanReceiveSignedEventsWithoutObjectPermissions() {
        String raw=event('evt_guest_webhook', 'pi_guest_webhook', 'payment_intent.succeeded', true);
        User guest=[SELECT Id FROM User WHERE UserType='Guest' AND Profile.Name='donations Perfil' LIMIT 1];
        System.runAs(guest) {
            deliverSigned(raw); System.assertEquals(200, RestContext.response.statusCode);
            System.assertEquals(false, Schema.SObjectType.Opportunity.isAccessible());
            System.assertEquals(false, Schema.SObjectType.Opportunity.isCreateable());
            // Custom-setting describe access differs from business-object CRUD; assert the public response boundary.
            System.assert(!RestContext.response.responseBody.toString().contains(TEST_SECRET));
        }
        System.assertEquals(1, [SELECT count() FROM Opportunity WHERE Is_Anonymous__c=true]);
        System.assertEquals(0, PublicCampaignSelector.supporters(campaignId()).size());
    }
    @IsTest static void signatureAcceptsMultipleVersionsAndExactTimeBoundary() {
        String raw='{"message":"Prueba Álvarez"}';
        Long seconds=1700000000L; Datetime nowAt=Datetime.newInstance(seconds*1000);
        String valid=signature(raw, seconds);
        // Independent UTF-8 HMAC vector generated with Node.js crypto, not the verifier under test.
        System.assert(StripeSignatureVerifier.verify(Blob.valueOf(raw),
            't=1700000000,v1=615bcb914310ddb9508db731739dae1fcca3418402c2d55be3f4851205670e5f', TEST_SECRET, nowAt));
        System.assert(StripeSignatureVerifier.verify(Blob.valueOf(raw), 'v0=ignored,v1='+'0'.repeat(64)+','+valid, TEST_SECRET, nowAt));
        System.assert(StripeSignatureVerifier.verify(Blob.valueOf(raw), signature(raw, seconds - 300), TEST_SECRET, nowAt));
        System.assert(StripeSignatureVerifier.verify(Blob.valueOf(raw), signature(raw, seconds + 300), TEST_SECRET, nowAt));
        for (String invalid : new List<String>{'t=invalid,v1=bad', valid+',t='+seconds, 'v1=bad', 'x'.repeat(8193)}) {
            System.assertEquals(false, StripeSignatureVerifier.verify(Blob.valueOf(raw), invalid, TEST_SECRET, nowAt));
        }
        System.assertEquals(false, StripeSignatureVerifier.verify(null, valid, TEST_SECRET, nowAt));
        System.assertEquals(false, StripeSignatureVerifier.verify(Blob.valueOf(raw), valid, 'wrong-key', nowAt));
    }
}
