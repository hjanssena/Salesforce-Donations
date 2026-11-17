@IsTest
private class HttpStripeClientTest {
    private class StripeMock implements HttpCalloutMock {
        Integer status;
        String body;
        Boolean timeout;
        String lastKey;
        Map<String, String> expectedMetadata = metadata();
        StripeMock(Integer status, String body) { this.status = status; this.body = body; }
        public HttpResponse respond(HttpRequest request) {
            System.assertEquals('callout:Stripe_API/v1/payment_intents', request.getEndpoint());
            System.assertEquals('POST', request.getMethod());
            System.assertEquals('application/x-www-form-urlencoded', request.getHeader('Content-Type'));
            System.assertEquals(null, request.getHeader('Authorization'), 'Named Credential owns authentication.');
            System.assert(request.getBody().contains('amount=25050'));
            System.assert(request.getBody().contains('currency=mxn'));
            System.assert(request.getBody().contains('payment_method_types%5B0%5D=card'));
            System.assert(!request.getBody().contains('receipt_email'));
            System.assert(!request.getBody().contains('confirm='));
            Map<String, String> decoded = new Map<String, String>();
            for (String field : request.getBody().split('&')) {
                List<String> parts = field.split('=');
                decoded.put(EncodingUtil.urlDecode(parts[0], 'UTF-8'), EncodingUtil.urlDecode(parts[1], 'UTF-8'));
            }
            for (String key : expectedMetadata.keySet()) {
                System.assertEquals(expectedMetadata.get(key), decoded.get('metadata[' + key + ']'), key);
            }
            System.assert(request.getHeader('Idempotency-Key').startsWith('donations-v1-'));
            if (lastKey != null) { System.assertEquals(lastKey, request.getHeader('Idempotency-Key')); }
            lastKey = request.getHeader('Idempotency-Key');
            if (timeout == true) { throw new CalloutException('Simulated timeout with confidential provider details'); }
            HttpResponse response = new HttpResponse(); response.setStatusCode(status); response.setBody(body); return response;
        }
    }
    private static Map<String, String> metadata() {
        return new Map<String, String>{'schema_version'=>'1', 'campaign_id'=>'fictitious-campaign',
            'donor_email'=>'test@example.com', 'is_anonymous'=>'false', 'invoice_requested'=>'true',
            'public_name'=>'Prueba Álvarez & equipo', 'invoice_full_name'=>'Persona de Prueba',
            'invoice_rfc'=>'AAAA010101AAA', 'invoice_taxpayer_type'=>'individual',
            'invoice_postal_code'=>'97000', 'invoice_tax_regime'=>'612', 'invoice_cfdi_use'=>'D04',
            'invoice_email'=>'invoice@example.com'};
    }
    private static String successBody() {
        return '{"id":"pi_test_example","client_secret":"pi_test_example_secret_example",' +
            '"amount":25050,"currency":"mxn","livemode":false,"payment_method_types":["card"]}';
    }
    @IsTest static void createsTestIntentAndReusesIdempotencyKey() {
        StripeMock mock = new StripeMock(200, successBody()); Test.setMock(HttpCalloutMock.class, mock);
        HttpStripeClient provider = new HttpStripeClient('attempt-12345678');
        Test.startTest();
        Map<String, Object> first = provider.createPaymentIntent(250.50, metadata());
        Map<String, Object> retry = new HttpStripeClient('attempt-12345678').createPaymentIntent(250.50, metadata());
        Test.stopTest();
        System.assertEquals(first.get('paymentIntentId'), retry.get('paymentIntentId'));
        System.assertEquals(250.50, first.get('amount'));
        System.assertEquals('mxn', first.get('currency'));
        System.assertEquals(0, [SELECT count() FROM Opportunity]);
        System.assertEquals(0, [SELECT count() FROM Stripe_Event__c]);
    }
    @IsTest static void providerFailuresAreSanitized() {
        List<String> bodies = new List<String>{'not-json', '{}', successBody().replace('false', 'true'),
            successBody().replace('mxn', 'usd'), successBody().replace('25050', '25000'),
            successBody().replace('["card"]', '["card","link"]'),
            successBody().replace('pi_test_example_secret_example', 'invalid')};
        for (String body : bodies) {
            Test.setMock(HttpCalloutMock.class, new StripeMock(200, body));
            assertProviderError();
        }
        Test.setMock(HttpCalloutMock.class, new StripeMock(401, '{"error":"confidential"}')); assertProviderError();
        Test.setMock(HttpCalloutMock.class, new StripeMock(500, '{"error":"confidential"}')); assertProviderError();
        StripeMock timeout = new StripeMock(200, successBody()); timeout.timeout = true;
        Test.setMock(HttpCalloutMock.class, timeout); assertProviderError();
    }
    private static void assertProviderError() {
        try { new HttpStripeClient().createPaymentIntent(250.50, metadata()); System.assert(false, 'Expected provider failure.'); }
        catch (ApiException problem) {
            System.assertEquals(503, problem.statusCode);
            System.assertEquals('PAYMENT_PROVIDER_ERROR', problem.errorCode);
            System.assertEquals('PAYMENT_PROVIDER_ERROR', problem.getMessage());
        }
    }
    @IsTest static void rejectsInvalidIdempotencyKeys() {
        for (String key : new List<String>{'', 'short', 'invalid key', 'x'.repeat(129), 'header\r\ninjection'}) {
            try { new HttpStripeClient(key); System.assert(false); }
            catch (ApiException problem) {
                System.assertEquals(400, problem.statusCode);
                System.assertEquals('idempotencyKey', problem.fields[0].get('field'));
            }
        }
    }
    @IsTest static void publicResourceUsesHttpProviderWithoutWritingDonations() {
        Date today = CampaignService.today();
        Campaign campaignRecord = new Campaign(Name='Stripe HTTP test', Description='Fictitious campaign',
            Purpose__c='Test only', Image_Url__c='https://example.com/test.png', ExpectedRevenue=1000,
            StartDate=today.addDays(-1), EndDate=today.addDays(1));
        Map<String, Schema.SObjectField> fields = Campaign.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).fields.getMap();
        if (fields.containsKey('Visibility_Start_Date__c')) {
            campaignRecord.put('Visibility_Start_Date__c', campaignRecord.StartDate);
            campaignRecord.put('Visibility_End_Date__c', campaignRecord.EndDate);
        }
        insert as system campaignRecord;
        Map<String, Object> input = new Map<String, Object>{'campaignId'=>campaignRecord.Id, 'amount'=>250.50,
            'donorEmail'=>'test@example.com', 'isAnonymous'=>true};
        StripeMock mock = new StripeMock(200, successBody());
        mock.expectedMetadata = PaymentSessionService.buildMetadata(input);
        Test.setMock(HttpCalloutMock.class, mock);
        PaymentSessionService.client = null;
        Test.startTest();
        for (String header : new List<String>{'Idempotency-Key', 'idempotency-key', 'IDEMPOTENCY-KEY'}) {
            RestContext.request = new RestRequest(); RestContext.response = new RestResponse();
            RestContext.request.httpMethod = 'POST';
            RestContext.request.requestURI = '/services/apexrest/donations/v1/payment-sessions';
            RestContext.request.requestBody = Blob.valueOf(JSON.serialize(input));
            RestContext.request.addHeader(header, 'public-attempt-123');
            PaymentSessionsResource.createSession();
            System.assertEquals(200, RestContext.response.statusCode, RestContext.response.responseBody.toString());
            System.assertEquals('donations-v1-public-attempt-123', mock.lastKey, header);
        }
        Test.stopTest();
        System.assertEquals(200, RestContext.response.statusCode, RestContext.response.responseBody.toString());
        System.assertEquals('donations-v1-public-attempt-123', mock.lastKey);
        System.assertEquals(0, [SELECT count() FROM Opportunity]);
        System.assertEquals(0, [SELECT count() FROM Contact]);
        StripeMock failed = new StripeMock(401, '{"error":"confidential provider detail"}');
        failed.expectedMetadata = mock.expectedMetadata;
        Test.setMock(HttpCalloutMock.class, failed);
        PaymentSessionsResource.createSession();
        System.assertEquals(503, RestContext.response.statusCode);
        System.assert(RestContext.response.responseBody.toString().contains('PAYMENT_PROVIDER_ERROR'));
        System.assert(!RestContext.response.responseBody.toString().contains('confidential'));
    }
}
