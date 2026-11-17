/** Verifies the exact Stripe snapshot body before any JSON parsing. */
public with sharing class StripeSignatureVerifier {
    public static Boolean verify(Blob body, String header, String secret, Datetime nowAt) {
        if (body == null || String.isBlank(header) || header.length() > 8192 || String.isBlank(secret)) {
            return false;
        }
        try {
            String timestamp;
            List<String> signatures = new List<String>();
            for (String entry : header.split(',')) {
                List<String> pair = entry.trim().split('=', 2);
                if (pair.size() != 2) { continue; }
                if (pair[0] == 't') {
                    if (timestamp != null) { return false; }
                    timestamp = pair[1];
                } else if (pair[0] == 'v1' && Pattern.matches('^[a-fA-F0-9]{64}$', pair[1])) {
                    signatures.add(pair[1]);
                }
            }
            if (timestamp == null || !Pattern.matches('^[0-9]{1,12}$', timestamp) || signatures.isEmpty()) { return false; }
            Long seconds = Long.valueOf(timestamp);
            Long current = nowAt.getTime() / 1000;
            if (seconds < current - 300 || seconds > current + 300) { return false; }
            Blob signedBody = Blob.valueOf(timestamp + '.' + body.toString());
            Boolean matched = false;
            for (String signature : signatures) {
                matched = Crypto.verifyHMac('hmacSHA256', signedBody, Blob.valueOf(secret), EncodingUtil.convertFromHex(signature)) || matched;
            }
            return matched;
        } catch (Exception invalid) { return false; }
    }
}
