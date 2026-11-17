@RestResource(urlMapping='/donations/v1/payment-sessions')
global with sharing class PaymentSessionsResource {
    @HttpPost global static void createSession() {
        try {
            Map<String, Object> input;
            try {
                input = (Map<String, Object>)JSON.deserializeUntyped(RestContext.request.requestBody.toString());
            } catch (Exception malformed) { throw ApiException.create(400, 'VALIDATION_FAILED'); }
            String idempotencyKey;
            // HTTP header names are case-insensitive; browsers can send lowercase names.
            for (String name : RestContext.request.headers.keySet()) {
                if (name.equalsIgnoreCase('Idempotency-Key')) {
                    idempotencyKey = RestContext.request.headers.get(name);
                    break;
                }
            }
            ApiResponse.send(200, PaymentSessionService.createSession(input, idempotencyKey));
        } catch (Exception problem) { ApiResponse.fail(problem); }
    }
}
