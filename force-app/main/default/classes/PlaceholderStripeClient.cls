/** E1 only. A placeholder cannot confirm a Stripe payment and never writes a donation. */
public with sharing class PlaceholderStripeClient implements StripeClient {
    public Map<String, Object> createPaymentIntent(Decimal amount, Map<String, String> metadata) {
        String intentId = 'pi_mock_' + EncodingUtil.convertToHex(Crypto.generateAesKey(128));
        return new Map<String, Object>{'paymentIntentId'=>intentId,
            'clientSecret'=>intentId + '_secret_mock', 'amount'=>amount, 'currency'=>'mxn'};
    }
}
