/** Narrow system-mode event-log writer. The guest has no business-object CRUD.
 * Signature verification precedes all payload parsing; no raw body or provider error is persisted.
 */
public without sharing class StripeWebhookService {
    public class WebhookException extends Exception {
        public Integer statusCode;
        public String reason;
    }
    public static void handle(Blob rawBody, String signature) {
        Stripe_Settings__c settings = Stripe_Settings__c.getOrgDefaults();
        if (settings == null || String.isBlank(settings.Webhook_Secret__c)) { throw rejected(503, 'SIGNING_SECRET_NOT_CONFIGURED'); }
        if (!StripeSignatureVerifier.verify(rawBody, signature, settings.Webhook_Secret__c, System.now())) {
            throw rejected(400, 'INVALID_SIGNATURE_OR_TIMESTAMP');
        }
        Map<String, Object> event;
        try {
            event = (Map<String, Object>)JSON.deserializeUntyped(rawBody.toString());
            if (event == null || event.get('livemode') != false ||
                !Pattern.matches('^evt_[A-Za-z0-9_]{1,221}$', (String)event.get('id')) ||
                !Pattern.matches('^[a-z0-9_.]{1,100}$', (String)event.get('type'))) {
                throw rejected(400, 'INVALID_EVENT_ENVELOPE');
            }
        } catch (Exception malformed) { throw rejected(400, 'INVALID_EVENT_ENVELOPE'); }
        String eventId = (String)event.get('id');
        String type = (String)event.get('type');
        String paymentId;
        if (new Set<String>{'payment_intent.succeeded', 'payment_intent.payment_failed', 'payment_intent.canceled'}.contains(type)) {
            try {
                Map<String, Object> payment = (Map<String, Object>)((Map<String, Object>)event.get('data')).get('object');
                paymentId = (String)payment.get('id');
                if (payment.get('livemode') != false || !Pattern.matches('^pi_[A-Za-z0-9_]{1,252}$', paymentId)) {
                    throw rejected(400, 'INVALID_PAYMENT_ENVELOPE');
                }
            } catch (Exception malformed) { throw rejected(400, 'INVALID_PAYMENT_ENVELOPE'); }
        }
        // Only authenticated event IDs reach this system-mode lookup.
        List<Stripe_Event__c> prior = [SELECT Id FROM Stripe_Event__c WHERE Stripe_Event_Id__c=:eventId
            WITH SYSTEM_MODE LIMIT 1];
        if (!prior.isEmpty()) { return; }
        if (type == 'payment_intent.succeeded') {
            DonationRecorder.Result result = DonationRecorder.recordVerifiedEvent(rawBody.toString());
            if (result.duplicate) { logHandled(eventId, type, paymentId, 'Duplicate', 'PAYMENT_ALREADY_RECORDED', result.opportunityId); }
        } else {
            String reason = type == 'payment_intent.payment_failed' ? 'PAYMENT_FAILED' :
                (type == 'payment_intent.canceled' ? 'PAYMENT_CANCELED' : 'IGNORED_EVENT_TYPE');
            logHandled(eventId, type, paymentId, 'Processed', reason, null);
        }
    }
    private static void logHandled(String eventId, String type, String paymentId, String status, String reason, Id donationId) {
        Stripe_Event__c notice = new Stripe_Event__c(Stripe_Event_Id__c=eventId, Type__c=type,
            Payment_Intent_Id__c=paymentId, Status__c=status, Reason__c=reason, Received_At__c=System.now(), Opportunity__c=donationId);
        insert as system notice;
    }
    public static void logRejected(String reason) {
        // Never use an unsigned event ID: an attacker must not poison the genuine-event uniqueness key.
        Stripe_Event__c notice = new Stripe_Event__c(
            Stripe_Event_Id__c='rejected_' + EncodingUtil.convertToHex(Crypto.generateAesKey(128)),
            Status__c='Rejected', Reason__c=reason, Received_At__c=System.now());
        insert as system notice;
    }
    private static WebhookException rejected(Integer status, String reason) {
        WebhookException problem = new WebhookException('The payment notice could not be accepted.');
        problem.statusCode = status; problem.reason = reason; return problem;
    }
}
