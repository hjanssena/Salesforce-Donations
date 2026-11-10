public with sharing class ApiResponse {
    public static void send(Integer statusCode, Object body) {
        RestContext.response.statusCode = statusCode;
        RestContext.response.addHeader('Content-Type', 'application/json; charset=UTF-8');
        RestContext.response.addHeader('Cache-Control', 'no-store');
        RestContext.response.responseBody = Blob.valueOf(JSON.serialize(body));
    }
    public static void fail(Exception problem) {
        Integer statusCode = 500;
        String code = 'INTERNAL_ERROR';
        List<Map<String, String>> fields = new List<Map<String, String>>();
        if (problem instanceof ApiException) {
            ApiException known = (ApiException)problem;
            statusCode = known.statusCode;
            code = known.errorCode;
            fields = known.fields;
        }
        send(statusCode, new Map<String, Object>{'error' => new Map<String, Object>{
            'code' => code, 'message' => code == 'VALIDATION_FAILED' ?
                'One or more fields are invalid.' : 'The request could not be completed.',
            'fields' => fields
        }});
    }
}
