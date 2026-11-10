public with sharing class PaymentSessionValidator {
    public static Map<String, Object> validate(Map<String, Object> input) {
        ApiException problem = ApiException.create(400, 'VALIDATION_FAILED');
        if (input == null) { input = new Map<String, Object>(); }
        text(input, 'campaignId', 18, true, problem);
        email(input, 'donorEmail', problem);
        Object amount = input.get('amount');
        if (amount == null) { add(problem, 'amount', 'REQUIRED'); }
        else if (!(amount instanceof Decimal) && !(amount instanceof Integer) && !(amount instanceof Long)) {
            add(problem, 'amount', 'INVALID_FORMAT');
        } else {
            Decimal value = Decimal.valueOf(String.valueOf(amount));
            if (value < 50) { add(problem, 'amount', 'AMOUNT_BELOW_MINIMUM'); }
            if (value != value.setScale(2)) { add(problem, 'amount', 'INVALID_FORMAT'); }
        }
        if (input.get('isAnonymous') == null) { add(problem, 'isAnonymous', 'REQUIRED'); }
        else if (!(input.get('isAnonymous') instanceof Boolean)) { add(problem, 'isAnonymous', 'INVALID_FORMAT'); }
        if (input.get('isAnonymous') == true && input.containsKey('publicName')) {
            add(problem, 'publicName', 'NOT_ALLOWED');
        } else if (input.get('isAnonymous') == false) {
            String name = text(input, 'publicName', 80, true, problem);
            if (name != null) {
                for (String word : PublicCampaignSelector.bannedWords()) {
                    if (name.toLowerCase().contains(word)) { add(problem, 'publicName', 'BANNED_WORD'); break; }
                }
            }
        }
        if (input.get('invoice') != null) {
            if (!(input.get('invoice') instanceof Map<String, Object>)) { add(problem, 'invoice', 'INVALID_FORMAT'); }
            else { validateInvoice((Map<String, Object>)input.get('invoice'), problem); }
        }
        if (!problem.fields.isEmpty()) { throw problem; }
        return input;
    }
    private static void validateInvoice(Map<String, Object> invoice, ApiException parent) {
        ApiException problem = ApiException.create(400, 'VALIDATION_FAILED');
        text(invoice, 'fullName', 150, true, problem);
        email(invoice, 'email', problem);
        String rfc = text(invoice, 'rfc', 13, true, problem);
        String kind = text(invoice, 'taxpayerType', 20, true, problem);
        if (kind != null && kind != 'individual' && kind != 'company') { add(problem, 'taxpayerType', 'INVALID_FORMAT'); }
        if (rfc != null && (!Pattern.matches('^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$', rfc) ||
            (kind == 'individual' && rfc.length() != 13) || (kind == 'company' && rfc.length() != 12))) {
            add(problem, 'rfc', 'INVALID_FORMAT');
        }
        String postal = text(invoice, 'postalCode', 5, true, problem);
        if (postal != null && !Pattern.matches('^[0-9]{5}$', postal)) { add(problem, 'postalCode', 'INVALID_FORMAT'); }
        String regime = text(invoice, 'taxRegime', 3, true, problem);
        if (regime != null && !new Set<String>{'601','603','605','612','621','626'}.contains(regime)) {
            add(problem, 'taxRegime', 'INVALID_FORMAT');
        }
        String useCode = text(invoice, 'cfdiUse', 3, true, problem);
        if (useCode != null && !new Set<String>{'D04','G03','S01'}.contains(useCode)) { add(problem, 'cfdiUse', 'INVALID_FORMAT'); }
        for (Map<String, String> issue : problem.fields) {
            issue.put('field', 'invoice.' + issue.get('field')); parent.fields.add(issue);
        }
    }
    private static String text(Map<String, Object> input, String key, Integer maxLength, Boolean required, ApiException problem) {
        Object raw = input.get(key);
        if (raw == null || (raw instanceof String && String.isBlank((String)raw))) {
            if (required) { add(problem, key, 'REQUIRED'); } return null;
        }
        if (!(raw instanceof String)) { add(problem, key, 'INVALID_FORMAT'); return null; }
        String value = (String)raw;
        if (value.length() > maxLength) { add(problem, key, 'TOO_LONG'); }
        return value;
    }
    private static void email(Map<String, Object> input, String key, ApiException problem) {
        String value = text(input, key, 254, true, problem);
        if (value != null && !Pattern.matches('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', value)) { add(problem, key, 'INVALID_FORMAT'); }
    }
    private static void add(ApiException problem, String field, String code) {
        problem.fields.add(new Map<String, String>{'field'=>field, 'code'=>code});
    }
}
