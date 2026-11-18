/**
 * Sends the donor emails for donations the verified webhook has just recorded (RF-D5).
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
            List<Boolean> outcomes = new List<Boolean>();
            for (Messaging.SendEmailResult result : Messaging.sendEmail(messages, false)) { outcomes.add(result.isSuccess()); }
            requireAllSent(outcomes);
        }
    }

    /**
     * @param outcomes whether each message was accepted for delivery
     * @throws DonationEmailException when any message was not accepted
     */
    @TestVisible
    private static void requireAllSent(List<Boolean> outcomes) {
        Integer failures = 0;
        for (Boolean accepted : outcomes) {
            if (accepted != true) { failures++; }
        }
        if (failures > 0) {
            throw new DonationEmailException(failures + ' of ' + outcomes.size() + ' donation emails failed.');
        }
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
        try {
            sender.send(receipts);
        } catch (DonationEmailException problem) {
            throw problem;
        } catch (Exception problem) {
            throw new DonationEmailException('The donation receipts could not be sent.', problem);
        }
    }
}
