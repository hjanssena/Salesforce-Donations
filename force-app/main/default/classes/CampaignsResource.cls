@RestResource(urlMapping='/donations/v1/campaigns/*')
global with sharing class CampaignsResource {
    @HttpGet global static void getCampaigns() {
        try {
            String path = RestContext.request.requestURI.substringAfter('/donations/v1/campaigns');
            if (path == '' || path == '/') {
                ApiResponse.send(200, CampaignService.listCampaigns(RestContext.request.params.get('status')));
            } else {
                ApiResponse.send(200, CampaignService.detail(path.substring(1)));
            }
        } catch (Exception problem) { ApiResponse.fail(problem); }
    }
}
