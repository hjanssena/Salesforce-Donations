@RestResource(urlMapping='/donations/v1/webhooks/stripe')
global with sharing class StripeWebhookResource {
    @HttpPost global static void receive() {
        try {
            String signature;
            for (String name : RestContext.request.headers.keySet()) {
                if (name.equalsIgnoreCase('Stripe-Signature')) { signature = RestContext.request.headers.get(name); break; }
            }
            StripeWebhookService.handle(RestContext.request.requestBody, signature);
            ApiResponse.send(200, new Map<String, Object>{'received'=>true});
        } catch (Exception problem) {
            Integer status = 500;
            String reason = 'RECORDING_FAILED';
            if (problem instanceof StripeWebhookService.WebhookException) {
                StripeWebhookService.WebhookException known = (StripeWebhookService.WebhookException)problem;
                status = known.statusCode; reason = known.reason;
            }
            try { StripeWebhookService.logRejected(reason); }
            catch (Exception loggingFailure) { status = 500; }
            ApiResponse.fail(ApiException.create(status, status == 400 ? 'VALIDATION_FAILED' : 'INTERNAL_ERROR'));
        }
    }
}
