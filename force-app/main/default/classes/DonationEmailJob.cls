/**
 * Sends the donor emails for donations the verified webhook has just recorded (RF-D5), with the
 * simulated invoice PDF attached when one was requested (RF-F3).
 * It runs after the recording transaction commits, so a failed email never rolls back a donation
 * or makes Stripe retry the notice. Only the webhook enqueues it, and only for new donations,
 * so repeated notices never send a second receipt.
 *
 * @example
 * System.enqueueJob(new DonationEmailJob(new Set<Id>{ donationId }));
 */
public with sharing class DonationEmailJob implements Queueable {
    @TestVisible
    private static Sender sender = new PlatformSender();

    private final Set<Id> donationIds;

    private static final String INVOICE_REQUESTED = 'Requested';
    private static final String INVOICE_SENT = 'Sent';
    private static final String INVOICE_FAILED = 'Failed';

    /**
     * Records the invoice outcome after the job ends. A finalizer runs in its own transaction,
     * so a failed send is still recorded as Failed while the job itself is marked as failed.
     */
    public class InvoiceStatusFinalizer implements Finalizer {
        private final Set<Id> donationIds;

        /**
         * @param donationIds the donations whose invoice requests were attached
         */
        public InvoiceStatusFinalizer(Set<Id> donationIds) {
            this.donationIds = donationIds ?? new Set<Id>();
        }

        /**
         * @param context the finalizer context with the job result
         */
        public void execute(FinalizerContext context) {
            markInvoices(donationIds, context?.getResult() == ParentJobResult.SUCCESS);
        }
    }

    /** Thrown when receipts cannot be sent. The message names no donor and no address. */
    public class DonationEmailException extends Exception {}

    /** Delivers built messages. Tests replace it so they do not depend on the org's deliverability. */
    public interface Sender {
        /**
         * @param messages the messages to deliver
         */
        void send(List<Messaging.SingleEmailMessage> messages);
    }

    /** Delivers through Salesforce email, reserving the daily single-email capacity first. */
    public class PlatformSender implements Sender {
        /**
         * @param messages the messages to deliver
         * @throws DonationEmailException when the org cannot send, or any message fails
         */
        public void send(List<Messaging.SingleEmailMessage> messages) {
            Messaging.reserveSingleEmailCapacity(messages.size());
            List<String> failureCodes = new List<String>();
            for (Messaging.SendEmailResult result : Messaging.sendEmail(messages, false)) {
                if (result.isSuccess()) { continue; }
                failureCodes.add(result.getErrors().isEmpty() ? 'UNKNOWN' : String.valueOf(result.getErrors()[0].getStatusCode()));
            }
            requireAllSent(failureCodes, messages.size());
        }
    }

    /**
     * Fails with the Salesforce status codes only, so admins see why without any donor data.
     * @param failureCodes the status code of each message that was not accepted
     * @param total how many messages were sent
     * @throws DonationEmailException when any message was not accepted
     */
    @TestVisible
    private static void requireAllSent(List<String> failureCodes, Integer total) {
        if (failureCodes == null || failureCodes.isEmpty()) { return; }
        List<String> distinctCodes = new List<String>(new Set<String>(failureCodes));
        distinctCodes.sort();
        throw new DonationEmailException(failureCodes.size() + ' of ' + total + ' donation emails failed: ' +
            String.join(distinctCodes, ', ') + '.');
    }

    /**
     * @param donationIds IDs of the donations just recorded
     */
    public DonationEmailJob(Set<Id> donationIds) {
        this.donationIds = donationIds ?? new Set<Id>();
    }

    /**
     * Builds and sends the receipts. A failure marks the job as failed in Apex Jobs, with a message
     * that contains no personal data.
     * @param context the queueable context
     * @throws DonationEmailException when the receipts cannot be sent
     */
    public void execute(QueueableContext context) {
        List<Messaging.SingleEmailMessage> receipts = DonationReceiptEmail.build(donationIds);
        if (receipts.isEmpty()) { return; }
        // Direct calls (tests) have no queueable context and cannot attach a finalizer.
        if (context != null) { System.attachFinalizer(new InvoiceStatusFinalizer(donationIds)); }
        try {
            sender.send(receipts);
        } catch (DonationEmailException problem) {
            throw problem;
        } catch (Exception problem) {
            throw new DonationEmailException('The donation receipts could not be sent.', problem);
        }
    }

    /**
     * Marks the donations' pending invoice requests as Sent or Failed. Sent also stamps Sent_At__c
     * through the Invoice_Request flow. Intentional system access: the site guest has no object CRUD.
     * @param donationIds the donations whose emails were attempted
     * @param sent whether the emails were accepted for delivery
     */
    @TestVisible
    private static void markInvoices(Set<Id> donationIds, Boolean sent) {
        if (donationIds == null || donationIds.isEmpty()) { return; }
        List<Invoice_Request__c> invoices = [SELECT Id FROM Invoice_Request__c
            WHERE Opportunity__c IN :donationIds AND Status__c = :INVOICE_REQUESTED WITH SYSTEM_MODE];
        if (invoices.isEmpty()) { return; }
        for (Invoice_Request__c invoice : invoices) { invoice.Status__c = sent == true ? INVOICE_SENT : INVOICE_FAILED; }
        update as system invoices;
    }
}
