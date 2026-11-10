public interface StripeClient {
    Map<String, Object> createPaymentIntent(Decimal amount, Map<String, String> metadata);
}
