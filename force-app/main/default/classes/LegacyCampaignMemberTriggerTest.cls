/** Isolated regressions for legacy approval automation reached by NPSP donor rollups. */
@IsTest
private class LegacyCampaignMemberTriggerTest {
    private static Campaign campaign(String name) {
        Date today = CampaignService.today();
        Campaign item = new Campaign(Name=name, Description='Fictitious regression campaign',
            Purpose__c='Academic test', Image_Url__c='https://example.com/test.png', ExpectedRevenue=1000,
            StartDate=today.addDays(-1), EndDate=today.addDays(1), Scholarship_Cost__c=25,
            Total_Amount_Used__c=0, Total_money_raised_without_commission__c=0);
        Map<String, Schema.SObjectField> fields = Campaign.SObjectType.getDescribe(SObjectDescribeOptions.DEFERRED).fields.getMap();
        if (fields.containsKey('Visibility_Start_Date__c')) {
            item.put('Visibility_Start_Date__c', item.StartDate); item.put('Visibility_End_Date__c', item.EndDate);
        }
        insert as system item;
        return item;
    }
    private static List<CampaignMember> members(Id campaignId, Integer count) {
        List<Contact> donors = new List<Contact>();
        for (Integer index=0; index<count; index++) {
            donors.add(new Contact(LastName='Fictitious donor ' + index, Email='legacy-member-' + index + '@example.com'));
        }
        insert as system donors;
        List<CampaignMember> records = new List<CampaignMember>();
        for (Contact donor : donors) { records.add(new CampaignMember(CampaignId=campaignId, ContactId=donor.Id)); }
        insert as system records;
        return records;
    }
    @IsTest static void unrelatedBulkUpdatesNeedNoLegacyFund() {
        List<CampaignMember> records = members(campaign('Unrelated member updates').Id, 200);
        for (CampaignMember member : records) { member.Status='Responded'; }
        Test.startTest(); update as system records; Test.stopTest();
        System.assertEquals(200, [SELECT count() FROM CampaignMember WHERE HasResponded=true]);
        System.assertEquals(0, [SELECT count() FROM Campaign WHERE Name='FONDOS SDU']);
    }
    @IsTest static void missingFundDoesNotBlockApprovalChanges() {
        List<CampaignMember> records = members(campaign('Missing approval fund').Id, 1);
        Map<Id, CampaignMember> prior = new Map<Id, CampaignMember>(records).deepClone();
        records[0].campaign_member_status__c='Aprobado';
        Test.startTest();
        CampaignMemberTriggerHandler.handleAfterUpdate(records, new Map<Id, CampaignMember>(records), prior);
        Test.stopTest();
        System.assertEquals(0, [SELECT count() FROM Campaign WHERE Name='FONDOS SDU']);
    }
    @IsTest static void existingFundPreservesBulkApprovalAndReversal() {
        Campaign fund = campaign('FONDOS SDU');
        List<CampaignMember> records = members(campaign('Existing approval fund').Id, 200);
        Map<Id, CampaignMember> prior = new Map<Id, CampaignMember>(records).deepClone();
        for (CampaignMember member : records) { member.campaign_member_status__c='Aprobado'; }
        Test.startTest();
        CampaignMemberTriggerHandler.handleAfterUpdate(records, new Map<Id, CampaignMember>(records), prior);
        System.assertEquals(5000, [SELECT Total_Amount_Used__c FROM Campaign WHERE Id=:fund.Id WITH SYSTEM_MODE].Total_Amount_Used__c);
        Map<Id, CampaignMember> approved = new Map<Id, CampaignMember>(records).deepClone();
        for (CampaignMember member : records) { member.campaign_member_status__c=null; }
        CampaignMemberTriggerHandler.handleAfterUpdate(records, new Map<Id, CampaignMember>(records), approved);
        Test.stopTest();
        System.assertEquals(0, [SELECT Total_Amount_Used__c FROM Campaign WHERE Id=:fund.Id WITH SYSTEM_MODE].Total_Amount_Used__c);
    }
    @IsTest static void returningCampaignMemberCanDonateWithInvoice() {
        Campaign target = campaign('Returning donor invoice');
        Contact donor = new Contact(LastName='Fictitious returning donor', Email='returning-invoice@example.com');
        insert as system donor;
        insert as system new CampaignMember(CampaignId=target.Id, ContactId=donor.Id);
        Map<String,Object> input = new Map<String,Object>{'campaignId'=>target.Id,'amount'=>50,
            'donorEmail'=>donor.Email,'isAnonymous'=>true,'invoice'=>new Map<String,Object>{
                'fullName'=>'Fictitious invoice donor','rfc'=>'PRUE900101AB1','taxpayerType'=>'individual',
                'postalCode'=>'97000','taxRegime'=>'612','cfdiUse'=>'D04','email'=>donor.Email}};
        String body = JSON.serialize(new Map<String,Object>{'id'=>'evt_returningInvoice','type'=>'payment_intent.succeeded',
            'livemode'=>false,'data'=>new Map<String,Object>{'object'=>new Map<String,Object>{
                'id'=>'pi_returningInvoice','status'=>'succeeded','currency'=>'mxn','amount_received'=>5000,
                'metadata'=>PaymentSessionService.buildMetadata(input)}}});
        Test.startTest();
        DonationRecorder.Result recorded = DonationRecorder.recordVerifiedEvent(body);
        DonationRecorder.Result repeated = DonationRecorder.recordVerifiedEvent(body);
        Test.stopTest();
        System.assertEquals(recorded.opportunityId, repeated.opportunityId);
        System.assertEquals(true, repeated.duplicate);
        System.assertEquals(1, [SELECT count() FROM Invoice_Request__c WHERE Opportunity__c=:recorded.opportunityId]);
        System.assertEquals(1, [SELECT count() FROM Opportunity WHERE CampaignId=:target.Id]);
        System.assertEquals(50, CampaignService.requireCampaign(String.valueOf(target.Id), false).get('AmountWonOpportunities'));
        System.assertEquals(0, ((List<Object>)CampaignService.detail(String.valueOf(target.Id)).get('supporters')).size());
    }
}
