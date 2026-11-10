public with sharing class CampaignService {
    public static Date today() {
        return Date.valueOf(Datetime.now().format('yyyy-MM-dd', 'America/Merida'));
    }
    public static Map<String, Object> listCampaigns(String status) {
        status = String.isBlank(status) ? 'open' : status;
        if (status != 'open' && status != 'completed') {
            ApiException problem = ApiException.create(400, 'VALIDATION_FAILED');
            problem.fields.add(new Map<String, String>{'field'=>'status', 'code'=>'INVALID_FORMAT'});
            throw problem;
        }
        List<Object> campaigns = new List<Object>();
        for (Campaign item : PublicCampaignSelector.listCampaigns(status, today())) {
            campaigns.add(toPublic(item));
        }
        return new Map<String, Object>{'campaigns'=>campaigns};
    }
    public static Campaign requireCampaign(String rawId, Boolean requireOpen) {
        Id campaignId;
        try {
            campaignId = Id.valueOf(rawId);
            if (campaignId.getSObjectType() != Campaign.SObjectType) { throw new TypeException(); }
        } catch (Exception ignored) { throw ApiException.create(404, 'CAMPAIGN_NOT_FOUND'); }
        Campaign item = PublicCampaignSelector.find(campaignId);
        if (item == null || item.StartDate == null || item.EndDate == null || item.StartDate > today()) {
            throw ApiException.create(404, 'CAMPAIGN_NOT_FOUND');
        }
        if (requireOpen && item.EndDate < today()) { throw ApiException.create(409, 'CAMPAIGN_NOT_OPEN'); }
        return item;
    }
    public static Map<String, Object> detail(String campaignId) {
        Campaign item = requireCampaign(campaignId, false);
        Map<String, Object> result = toPublic(item);
        List<Object> supporters = new List<Object>();
        for (Opportunity donation : PublicCampaignSelector.supporters(item.Id)) {
            supporters.add(new Map<String, Object>{'displayName'=>donation.Public_Name__c, 'amount'=>donation.Amount});
        }
        result.put('supporters', supporters);
        return result;
    }
    private static Map<String, Object> toPublic(Campaign item) {
        return new Map<String, Object>{'id'=>item.Id, 'name'=>item.Name, 'description'=>item.Description,
            'purpose'=>item.Purpose__c, 'imageUrl'=>item.Image_Url__c, 'goalAmount'=>item.ExpectedRevenue,
            'raisedAmount'=>item.AmountWonOpportunities == null ? 0 : item.AmountWonOpportunities,
            'startDate'=>String.valueOf(item.StartDate), 'endDate'=>String.valueOf(item.EndDate),
            'status'=>item.EndDate < today() ? 'completed' : 'open'};
    }
}
