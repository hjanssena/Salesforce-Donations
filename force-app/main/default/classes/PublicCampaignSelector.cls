/** Intentional system access: guests have no business-object CRUD. Only public fields leave this selector. */
public without sharing class PublicCampaignSelector {
    public static List<Campaign> listCampaigns(String status, Date today) {
        if (status == 'completed') {
            return [SELECT Id, Name, Description, Purpose__c, Image_Url__c, ExpectedRevenue,
                AmountWonOpportunities, StartDate, EndDate FROM Campaign
                WHERE StartDate <= :today AND EndDate < :today
                WITH SYSTEM_MODE ORDER BY EndDate DESC, Id];
        }
        return [SELECT Id, Name, Description, Purpose__c, Image_Url__c, ExpectedRevenue,
            AmountWonOpportunities, StartDate, EndDate FROM Campaign
            WHERE StartDate <= :today AND EndDate >= :today
            WITH SYSTEM_MODE ORDER BY EndDate ASC, Id];
    }
    public static Campaign find(Id campaignId) {
        List<Campaign> rows = [SELECT Id, Name, Description, Purpose__c, Image_Url__c,
            ExpectedRevenue, AmountWonOpportunities, StartDate, EndDate, IsActive
            FROM Campaign WHERE Id = :campaignId WITH SYSTEM_MODE LIMIT 1];
        return rows.isEmpty() ? null : rows[0];
    }
    public static List<Opportunity> supporters(Id campaignId) {
        return [SELECT Public_Name__c, Amount FROM Opportunity
            WHERE CampaignId = :campaignId AND IsWon = true AND Is_Anonymous__c = false
            AND Display_Status__c = 'Visible' AND Public_Name__c != null
            WITH SYSTEM_MODE ORDER BY CreatedDate DESC, Id DESC];
    }
    public static Set<String> bannedWords() {
        Set<String> words = new Set<String>();
        for (Banned_Word__mdt word : [SELECT Word__c FROM Banned_Word__mdt WHERE Word__c != null WITH SYSTEM_MODE]) {
            if (String.isNotBlank(word.Word__c)) { words.add(word.Word__c.toLowerCase()); }
        }
        return words;
    }
}
