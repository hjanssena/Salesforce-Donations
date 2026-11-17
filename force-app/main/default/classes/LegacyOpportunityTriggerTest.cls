/** Regression coverage for the shared sandbox dependency, using isolated fictitious data only. */
@IsTest
private class LegacyOpportunityTriggerTest {
    private static Campaign campaign(String name) {
        Date today = CampaignService.today();
        Campaign item = new Campaign(Name=name, Description='Fictitious regression campaign',
            Purpose__c='Academic test', Image_Url__c='https://example.com/test.png', ExpectedRevenue=1000,
            StartDate=today.addDays(-1), EndDate=today.addDays(1), Total_money_raised_without_commission__c=0);
        Map<String, Schema.SObjectField> fields = Campaign.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).fields.getMap();
        if (fields.containsKey('Visibility_Start_Date__c')) {
            item.put('Visibility_Start_Date__c', item.StartDate); item.put('Visibility_End_Date__c', item.EndDate);
        }
        insert as system item;
        return item;
    }
    private static List<Opportunity> donations(Id campaignId, Integer count) {
        List<Opportunity> records = new List<Opportunity>();
        Schema.RecordTypeInfo donationType = Opportunity.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED)
            .getRecordTypeInfosByDeveloperName().get('Donation');
        for (Integer index=0; index<count; index++) {
            Opportunity item = new Opportunity(Name='Legacy regression ' + index, Amount=50,
                StageName='Closed Won', CloseDate=Date.today(), CampaignId=campaignId,
                Source__c='Manual', Is_Anonymous__c=true, Display_Status__c='Visible');
            if (donationType != null && donationType.isActive()) { item.RecordTypeId=donationType.getRecordTypeId(); }
            records.add(item);
        }
        return records;
    }
    @IsTest static void missingFundAllowsInsertUpdateAndDelete() {
        Campaign target = campaign('Missing legacy fund test');
        List<Opportunity> records = donations(target.Id, 1);
        Test.startTest();
        insert as system records;
        records[0].Amount=75; update as system records;
        delete as system records;
        Test.stopTest();
        System.assertEquals(0, [SELECT count() FROM Opportunity]);
        System.assertEquals(0, [SELECT count() FROM Campaign WHERE Name='FONDOS SDU']);
    }
    @IsTest static void missingFundAllowsTwoHundredRecords() {
        Campaign target = campaign('Bulk missing legacy fund test');
        List<Opportunity> records = donations(target.Id, 200);
        Test.startTest(); insert as system records; Test.stopTest();
        System.assertEquals(200, [SELECT count() FROM Opportunity WHERE CampaignId=:target.Id]);
        System.assertEquals(0, [SELECT count() FROM Campaign WHERE Name='FONDOS SDU']);
    }
    @IsTest static void existingFundPreservesBulkRollup() {
        Campaign fund = campaign('FONDOS SDU');
        Campaign target = campaign('Bulk existing legacy fund test');
        List<Opportunity> records = donations(target.Id, 200);
        Test.startTest();
        insert as system records; assertFundMatchesWon(fund.Id, target.Id);
        for (Opportunity item : records) { item.Amount=75; }
        update as system records; assertFundMatchesWon(fund.Id, target.Id);
        delete as system records;
        Test.stopTest();
        System.assertEquals(0, [SELECT Total_money_raised_without_commission__c FROM Campaign WHERE Id=:fund.Id WITH SYSTEM_MODE].Total_money_raised_without_commission__c);
    }
    @IsTest static void existingFundPreservesStageTransitions() {
        Campaign fund = campaign('FONDOS SDU');
        Campaign target = campaign('Stage transition legacy test');
        Opportunity item = donations(target.Id, 1)[0];
        String openStage = [SELECT MasterLabel FROM OpportunityStage WHERE IsActive=true AND IsClosed=false ORDER BY SortOrder LIMIT 1].MasterLabel;
        item.StageName=openStage;
        Test.startTest();
        insert as system item; assertFundMatchesWon(fund.Id, target.Id);
        item.StageName='Closed Won'; update as system item; assertFundMatchesWon(fund.Id, target.Id);
        item.StageName=openStage; update as system item; assertFundMatchesWon(fund.Id, target.Id);
        Test.stopTest();
    }
    private static void assertFundMatchesWon(Id fundId, Id targetId) {
        AggregateResult total = [SELECT SUM(Amount_less_commissions__c) net FROM Opportunity
            WHERE CampaignId=:targetId AND StageName='Closed Won' WITH SYSTEM_MODE];
        Decimal expected = (Decimal)total.get('net');
        System.assertEquals(expected == null ? 0 : expected,
            [SELECT Total_money_raised_without_commission__c FROM Campaign WHERE Id=:fundId WITH SYSTEM_MODE].Total_money_raised_without_commission__c);
    }
}
