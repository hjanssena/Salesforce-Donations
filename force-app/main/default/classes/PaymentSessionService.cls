public with sharing class PaymentSessionService {
    @TestVisible private static StripeClient client = new PlaceholderStripeClient();
    public static Map<String, Object> createSession(Map<String, Object> input) {
        PaymentSessionValidator.validate(input);
        CampaignService.requireCampaign((String)input.get('campaignId'), true);
        return client.createPaymentIntent(Decimal.valueOf(String.valueOf(input.get('amount'))), buildMetadata(input));
    }
    public static Map<String, String> buildMetadata(Map<String, Object> input) {
        Map<String, String> result = new Map<String, String>{'schema_version'=>'1',
            'campaign_id'=>(String)input.get('campaignId'), 'donor_email'=>(String)input.get('donorEmail'),
            'is_anonymous'=>String.valueOf(input.get('isAnonymous')),
            'invoice_requested'=>String.valueOf(input.get('invoice') != null)};
        if (input.get('isAnonymous') == false) { result.put('public_name', (String)input.get('publicName')); }
        if (input.get('invoice') != null) {
            Map<String, Object> invoice = (Map<String, Object>)input.get('invoice');
            Map<String, String> mapping = new Map<String, String>{'fullName'=>'full_name', 'rfc'=>'rfc',
                'taxpayerType'=>'taxpayer_type', 'postalCode'=>'postal_code', 'taxRegime'=>'tax_regime',
                'cfdiUse'=>'cfdi_use', 'email'=>'email'};
            for (String key : mapping.keySet()) { result.put('invoice_' + mapping.get(key), (String)invoice.get(key)); }
        }
        return result;
    }
}
