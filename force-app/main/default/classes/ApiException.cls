public with sharing class ApiException extends Exception {
    public Integer statusCode = 500;
    public String errorCode = 'INTERNAL_ERROR';
    public List<Map<String, String>> fields = new List<Map<String, String>>();
    public static ApiException create(Integer statusCode, String code) {
        ApiException problem = new ApiException(code);
        problem.statusCode = statusCode;
        problem.errorCode = code;
        return problem;
    }
}
