@RestResource(urlMapping='/donations/v1/payment-sessions')
global with sharing class PaymentSessionsResource {
    @HttpPost global static void createSession() {
        try {
            Map<String, Object> input;
            try {
                input = (Map<String, Object>)JSON.deserializeUntyped(RestContext.request.requestBody.toString());
            } catch (Exception malformed) { throw ApiException.create(400, 'VALIDATION_FAILED'); }
            ApiResponse.send(200, PaymentSessionService.createSession(input));
        } catch (Exception problem) { ApiResponse.fail(problem); }
    }
}
