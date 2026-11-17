/** Stripe Test Mode only. Authentication is supplied by the Named Credential, never by Apex. */
public with sharing class HttpStripeClient implements StripeClient {
    private String requestKey;
    public HttpStripeClient() { this(null); }
    public HttpStripeClient(String requestKey) {
        if (requestKey != null && !Pattern.matches('^[A-Za-z0-9_-]{8,128}$', requestKey)) {
            ApiException problem = ApiException.create(400, 'VALIDATION_FAILED');
            problem.fields.add(new Map<String, String>{'field'=>'idempotencyKey', 'code'=>'INVALID_FORMAT'});
            throw problem;
        }
        this.requestKey = 'donations-v1-' + (requestKey == null ?
            EncodingUtil.convertToHex(Crypto.generateAesKey(128)) : requestKey);
    }
    public Map<String, Object> createPaymentIntent(Decimal amount, Map<String, String> metadata) {
        try {
            List<String> fields = new List<String>{pair('amount', String.valueOf((amount * 100).longValue())),
                pair('currency', 'mxn'), pair('payment_method_types[0]', 'card'),
                pair('description', 'Donativo - ' + metadata.get('campaign_id'))};
            List<String> keys = new List<String>(metadata.keySet());
            keys.sort();
            for (String key : keys) { fields.add(pair('metadata[' + key + ']', metadata.get(key))); }
            HttpRequest request = new HttpRequest();
            request.setEndpoint('callout:Stripe_API/v1/payment_intents');
            request.setMethod('POST');
            request.setTimeout(20000);
            request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.setHeader('Idempotency-Key', requestKey);
            request.setBody(String.join(fields, '&'));
            HttpResponse response = new Http().send(request);
            if (response.getStatusCode() != 200) { throw providerError(); }
            Map<String, Object> intent = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
            String intentId = (String)intent.get('id');
            String clientSecret = (String)intent.get('client_secret');
            List<Object> methods = (List<Object>)intent.get('payment_method_types');
            if (intent.get('livemode') != false || intent.get('currency') != 'mxn' ||
                Decimal.valueOf(String.valueOf(intent.get('amount'))) != amount * 100 ||
                String.isBlank(intentId) || !intentId.startsWith('pi_') ||
                String.isBlank(clientSecret) || !clientSecret.startsWith(intentId + '_secret_') ||
                methods == null || methods.size() != 1 || methods[0] != 'card') { throw providerError(); }
            return new Map<String, Object>{'paymentIntentId'=>intentId, 'clientSecret'=>clientSecret,
                'amount'=>amount, 'currency'=>'mxn'};
        } catch (Exception problem) {
            // Never expose credentials, provider bodies, client secrets or callout details in errors/logs.
            throw providerError();
        }
    }
    private static String pair(String key, String value) {
        return EncodingUtil.urlEncode(key, 'UTF-8') + '=' + EncodingUtil.urlEncode(value, 'UTF-8');
    }
    private static ApiException providerError() { return ApiException.create(503, 'PAYMENT_PROVIDER_ERROR'); }
}
