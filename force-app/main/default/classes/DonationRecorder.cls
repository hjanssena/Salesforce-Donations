/** Internal E1 recorder. No REST/Invocable entry point. E2 must verify the signature before calling it.
 * Intentional system access: the guest has no object CRUD. All writes are atomic and use unique payment/event keys.
 */
public without sharing class DonationRecorder {
    public class RecordingException extends Exception {}
    public class Result {
        public Id opportunityId;
        public Boolean duplicate;
        public Result(Id opportunityId, Boolean duplicate) { this.opportunityId = opportunityId; this.duplicate = duplicate; }
    }
    public static Result recordVerifiedEvent(String rawEvent) {
        Map<String, Object> event = (Map<String, Object>)JSON.deserializeUntyped(rawEvent);
        if (event.get('livemode') != false || event.get('type') != 'payment_intent.succeeded') {
            throw new RecordingException('Only successful test payment events are accepted.');
        }
        String eventId = (String)event.get('id');
        Map<String, Object> payment = (Map<String, Object>)((Map<String, Object>)event.get('data')).get('object');
        String paymentId = (String)payment.get('id');
        if (String.isBlank(eventId) || !eventId.startsWith('evt_') || String.isBlank(paymentId) ||
            !paymentId.startsWith('pi_') || payment.get('currency') != 'mxn' || payment.get('status') != 'succeeded') {
            throw new RecordingException('Invalid successful payment event.');
        }
        List<Stripe_Event__c> priorEvents = [SELECT Opportunity__c FROM Stripe_Event__c
            WHERE Stripe_Event_Id__c = :eventId WITH SYSTEM_MODE LIMIT 1];
        if (!priorEvents.isEmpty()) { return new Result(priorEvents[0].Opportunity__c, true); }
        // Serializes same-payment deliveries through the unique Opportunity field; conflicts roll back for retry.
        List<Opportunity> priorPayments = [SELECT Id FROM Opportunity WHERE Stripe_Payment_Intent_Id__c = :paymentId
            WITH SYSTEM_MODE LIMIT 1];
        if (!priorPayments.isEmpty()) { return new Result(priorPayments[0].Id, true); }
        Map<String, Object> metadata = (Map<String, Object>)payment.get('metadata');
        if (metadata == null || metadata.get('schema_version') != '1' ||
            !new Set<Object>{'true','false'}.contains(metadata.get('is_anonymous')) ||
            !new Set<Object>{'true','false'}.contains(metadata.get('invoice_requested'))) {
            throw new RecordingException('Invalid metadata schema.');
        }
        Decimal cents = Decimal.valueOf(String.valueOf(payment.get('amount_received')));
        if (cents != cents.setScale(0) || cents < 5000) { throw new RecordingException('Invalid received amount.'); }
        Map<String, Object> request = new Map<String, Object>{'campaignId'=>metadata.get('campaign_id'),
            'amount'=>cents / 100, 'donorEmail'=>metadata.get('donor_email'), 'isAnonymous'=>metadata.get('is_anonymous') == 'true'};
        if (metadata.containsKey('public_name')) { request.put('publicName', metadata.get('public_name')); }
        Map<String, Object> invoice;
        if (metadata.get('invoice_requested') == 'true') {
            invoice = new Map<String, Object>{'fullName'=>metadata.get('invoice_full_name'), 'rfc'=>metadata.get('invoice_rfc'),
                'taxpayerType'=>metadata.get('invoice_taxpayer_type'), 'postalCode'=>metadata.get('invoice_postal_code'),
                'taxRegime'=>metadata.get('invoice_tax_regime'), 'cfdiUse'=>metadata.get('invoice_cfdi_use'), 'email'=>metadata.get('invoice_email')};
            request.put('invoice', invoice);
        }
        PaymentSessionValidator.validate(request);
        // A valid payment may settle after the campaign's end date. Do not discard settled money.
        Campaign campaign = CampaignService.requireCampaign((String)metadata.get('campaign_id'), false);
        String donorEmail = ((String)metadata.get('donor_email')).trim().toLowerCase();
        List<Contact> contacts = [SELECT Id, AccountId FROM Contact WHERE Email = :donorEmail
            WITH SYSTEM_MODE ORDER BY CreatedDate, Id LIMIT 2];
        if (contacts.size() > 1) { throw new RecordingException('Ambiguous donor email; staff resolution required.'); }
        Contact donor = contacts.isEmpty() ? null : contacts[0];
        Boolean company = invoice != null && invoice.get('taxpayerType') == 'company';
        String companyName = company ? (String)invoice.get('fullName') : null;
        List<Account> accounts = company ? [SELECT Id FROM Account WHERE Name = :companyName WITH SYSTEM_MODE LIMIT 2] : new List<Account>();
        if (accounts.size() > 1) { throw new RecordingException('Ambiguous company; staff resolution required.'); }
        Savepoint checkpoint = Database.setSavepoint();
        try {
            Id accountId = donor == null ? null : donor.AccountId;
            if (company) {
                Account business = accounts.isEmpty() ? new Account(Name=companyName) : accounts[0];
                if (business.Id == null) { insert as system business; }
                accountId = business.Id;
            }
            if (donor == null) {
                String donorName = invoice != null ? (String)invoice.get('fullName') :
                    (metadata.get('is_anonymous') == 'true' ? 'Anonymous donor' : (String)metadata.get('public_name'));
                donor = new Contact(LastName=donorName.left(80), Email=donorEmail, AccountId=accountId);
                insert as system donor;
            }
            Opportunity donation = new Opportunity(Name=('Donation - ' + campaign.Name).left(120),
                StageName='Closed Won', CloseDate=CampaignService.today(), CampaignId=campaign.Id, AccountId=accountId,
                Amount=cents / 100, Stripe_Payment_Intent_Id__c=paymentId, Source__c='Website',
                Is_Anonymous__c=metadata.get('is_anonymous') == 'true', Public_Name__c=(String)request.get('publicName'),
                Display_Status__c='Visible');
            // Optional sandbox adapter; the service also works on an org with only the master record type.
            Schema.RecordTypeInfo donationType = Opportunity.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED)
                .getRecordTypeInfosByDeveloperName().get('Donation');
            if (donationType != null && donationType.isActive()) { donation.RecordTypeId = donationType.getRecordTypeId(); }
            insert as system donation;
            List<OpportunityContactRole> existingRoles = [SELECT Id FROM OpportunityContactRole
                WHERE OpportunityId = :donation.Id AND ContactId = :donor.Id WITH SYSTEM_MODE LIMIT 1];
            if (existingRoles.isEmpty()) {
                OpportunityContactRole role = new OpportunityContactRole(OpportunityId=donation.Id, ContactId=donor.Id, IsPrimary=true);
                insert as system role;
            }
            if (invoice != null) {
                Invoice_Request__c invoiceRequest = new Invoice_Request__c(Opportunity__c=donation.Id,
                    Legal_Name__c=(String)invoice.get('fullName'), RFC__c=(String)invoice.get('rfc'),
                    Taxpayer_Type__c=company ? 'Company' : 'Individual', Postal_Code__c=(String)invoice.get('postalCode'),
                    Tax_Regime__c=(String)invoice.get('taxRegime'), Cfdi_Use__c=(String)invoice.get('cfdiUse'),
                    Invoice_Email__c=(String)invoice.get('email'), Status__c='Requested', Invoice_Type__c='Simulation');
                insert as system invoiceRequest;
            }
            Stripe_Event__c notice = new Stripe_Event__c(Stripe_Event_Id__c=eventId, Payment_Intent_Id__c=paymentId,
                Opportunity__c=donation.Id, Type__c='payment_intent.succeeded', Status__c='Processed', Received_At__c=System.now());
            insert as system notice;
            return new Result(donation.Id, false);
        } catch (Exception problem) {
            Database.rollback(checkpoint);
            throw problem;
        }
    }
}
