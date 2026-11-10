@RestResource(urlMapping='/donations/v1/health')
global with sharing class HealthResource {
    @HttpGet global static void ping() { respond(); }
    @HttpPost global static void pingPost() { respond(); }
    private static void respond() {
        ApiResponse.send(200, new Map<String, String>{'status' => 'ok'});
    }
}
