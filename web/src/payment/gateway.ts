import type { Stripe, StripeElements, StripeError } from '@stripe/stripe-js'

/**
 * Confirms a payment and reads its status back for the thank-you page.
 *
 * - `stripe`: the real flow (E2). `confirmPayment` with the clientSecret from
 *   Salesforce, then Stripe sends the donor to the thank-you page.
 * - `mock`: the E1 flow (contract section 5). The placeholder clientSecret
 *   cannot be confirmed, so the card is only turned into a PaymentMethod and
 *   the result is faked from Stripe's test card numbers.
 *
 * The same API_MODE switch picks both the API and the gateway.
 */

export type PaymentStatus = 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_action' | 'canceled'

export interface PaymentRecord {
  status: PaymentStatus
  /** Pesos, not centavos. */
  amount: number
}

export type ConfirmFailure = 'declined' | 'authentication' | 'card' | 'unknown'

/** Only failures come back: on success the browser goes to the thank-you page. */
export interface ConfirmError {
  reason: ConfirmFailure
  /** Stripe's own message, already in Spanish, for card input errors. */
  stripeMessage?: string
}

export interface ConfirmArgs {
  stripe: Stripe
  elements: StripeElements
  clientSecret: string
  paymentIntentId: string
  /** Pesos. */
  amount: number
  returnUrl: string
}

export interface PaymentGateway {
  confirm(args: ConfirmArgs): Promise<ConfirmError | null>
  retrieve(stripe: Stripe | null, clientSecret: string, paymentIntentId: string): Promise<PaymentRecord | null>
}

export const THANKS_PATH = '/gracias'

export function returnUrl(origin = window.location.origin): string {
  return `${origin}${THANKS_PATH}`
}

function failureOf(error: StripeError): ConfirmError {
  if (error.code === 'payment_intent_authentication_failure') return { reason: 'authentication' }
  if (error.type === 'card_error' && error.code === 'card_declined') return { reason: 'declined' }
  if (error.type === 'card_error' || error.type === 'validation_error') return { reason: 'card', stripeMessage: error.message }
  return { reason: 'unknown' }
}

export const stripeGateway: PaymentGateway = {
  async confirm({ stripe, elements, clientSecret, returnUrl }) {
    const { error } = await stripe.confirmPayment({ elements, clientSecret, confirmParams: { return_url: returnUrl } })
    // Without an error Stripe is already redirecting to returnUrl.
    return error ? failureOf(error) : null
  },
  async retrieve(stripe, clientSecret) {
    if (!stripe) return null
    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
    if (!paymentIntent) return null
    return { status: paymentIntent.status as PaymentStatus, amount: paymentIntent.amount / 100 }
  },
}

// ---- E1 mock ----

/** Stripe test cards (docs.stripe.com/testing), by their last four digits. */
const DECLINED = new Set(['0002', '9995', '9987', '0069', '0127', '0119'])
/** Cards that ask for 3D Secure: the mock treats them as a verification the donor left unfinished. */
const NEEDS_AUTHENTICATION = new Set(['3155', '3184', '3220'])

const STORE_PREFIX = 'mock-payment:'

export type Navigate = (url: string) => void

export function createMockGateway(
  storage: Pick<Storage, 'getItem' | 'setItem'> = window.sessionStorage,
  navigate: Navigate = (url) => window.location.assign(url),
): PaymentGateway {
  return {
    async confirm({ stripe, elements, paymentIntentId, clientSecret, amount, returnUrl }) {
      // A real call to Stripe test mode: it checks the card and tells us which test card it is.
      const { error, paymentMethod } = await stripe.createPaymentMethod({ elements })
      if (error) return failureOf(error)

      const last4 = paymentMethod.card?.last4 ?? ''
      if (DECLINED.has(last4)) return { reason: 'declined' }
      if (NEEDS_AUTHENTICATION.has(last4)) return { reason: 'authentication' }

      const record: PaymentRecord = { status: 'succeeded', amount }
      try {
        storage.setItem(STORE_PREFIX + paymentIntentId, JSON.stringify(record))
      } catch {
        // Private mode without storage: the thank-you page then says it cannot see the payment.
      }
      // The same query Stripe adds when it returns the donor to the site.
      const query = new URLSearchParams({
        payment_intent: paymentIntentId,
        payment_intent_client_secret: clientSecret,
        redirect_status: record.status,
      })
      navigate(`${returnUrl}?${query}`)
      return null
    },
    async retrieve(_stripe, clientSecret, paymentIntentId) {
      // The secret must belong to the intent, as with Stripe.
      if (!clientSecret.startsWith(`${paymentIntentId}_secret_`)) return null
      try {
        const raw = storage.getItem(STORE_PREFIX + paymentIntentId)
        return raw ? (JSON.parse(raw) as PaymentRecord) : null
      } catch {
        return null
      }
    },
  }
}
