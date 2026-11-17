trigger OpportunityTrigger on Opportunity (after insert, after update, after delete) {
    // Shared-org legacy rollup: a missing optional fund must not abort unrelated donations.
    // Triggers intentionally maintain this aggregate in system context; no guest CRUD is granted.
    List<Campaign> funds = [SELECT Id, Total_money_raised_without_commission__c
        FROM Campaign WHERE Name = 'FONDOS SDU' WITH SYSTEM_MODE LIMIT 1];
    if (!funds.isEmpty()) {
        Campaign fund = funds[0];
        if (Trigger.isInsert) {
            for (Opportunity donation : Trigger.new) {
                if (donation.StageName == 'Closed Won') {
                    fund.Total_money_raised_without_commission__c += donation.Amount_less_commissions__c;
                }
            }
        } else if (Trigger.isUpdate) {
            for (Opportunity prior : Trigger.oldMap.values()) {
                Opportunity current = Trigger.newMap.get(prior.Id);
                if (prior.StageName == 'Closed Won' && current.StageName != 'Closed Won') {
                    fund.Total_money_raised_without_commission__c -= prior.Amount_less_commissions__c;
                }
                if (prior.StageName != 'Closed Won' && current.StageName == 'Closed Won') {
                    fund.Total_money_raised_without_commission__c += current.Amount_less_commissions__c;
                }
                if (prior.StageName == 'Closed Won' && current.StageName == 'Closed Won') {
                    fund.Total_money_raised_without_commission__c += current.Amount_less_commissions__c - prior.Amount_less_commissions__c;
                }
            }
        } else if (Trigger.isDelete) {
            for (Opportunity donation : Trigger.old) {
                fund.Total_money_raised_without_commission__c -= donation.Amount_less_commissions__c;
            }
        }
        update as system fund;
    }
}
