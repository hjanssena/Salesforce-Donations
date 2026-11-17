/** Compatibility guard for existing trigger automation; system access maintains its legacy aggregate only. */
public without sharing class CampaignMemberTriggerHandler {
    public static void handleAfterUpdate(CampaignMember[] newMemberList,
        Map<Id, CampaignMember> newMemberMap, Map<Id, CampaignMember> oldMemberMap) {
        Set<Id> changedIds = new Set<Id>();
        for (CampaignMember prior : oldMemberMap.values()) {
            CampaignMember current = newMemberMap.get(prior.Id);
            if ((current.campaign_member_status__c == 'Aprobado') !=
                (prior.campaign_member_status__c == 'Aprobado')) {
                changedIds.add(prior.Id);
            }
        }
        // NPSP donation rollups update members without changing scholarship approval.
        if (changedIds.isEmpty()) { return; }
        // Preserve the legacy system-context rollup without widening guest permissions.
        List<Campaign> funds = [SELECT Id, Total_money_raised_without_commission__c, Total_Amount_Used__c
            FROM Campaign WHERE Name = 'FONDOS SDU' WITH SYSTEM_MODE LIMIT 1];
        if (funds.isEmpty()) { return; }
        Campaign fund = funds[0];
        Map<Id, CampaignMember> members = new Map<Id, CampaignMember>(
            [SELECT Id, Campaign.Scholarship_Cost__c FROM CampaignMember
             WHERE Id IN :changedIds WITH SYSTEM_MODE]);
        for (Id memberId : changedIds) {
            CampaignMember current = newMemberMap.get(memberId);
            Decimal cost = members.get(memberId).Campaign.Scholarship_Cost__c;
            if (current.campaign_member_status__c == 'Aprobado') {
                fund.Total_Amount_Used__c += cost;
            } else {
                fund.Total_Amount_Used__c -= cost;
            }
        }
        update as system fund;
    }
}
