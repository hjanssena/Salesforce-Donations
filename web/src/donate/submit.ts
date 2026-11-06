import { ApiError, type ApiClient } from '../api/client'
import type { FieldError, PaymentSession, PaymentSessionRequest } from '../api/types'
import { validatePaymentSession } from '../api/validation'
import type { ConfirmError } from '../payment/gateway'
import { errorMessage } from './messages'

/** What went wrong, for the form to show. `null` from a submit means the browser is leaving for the thank-you page. */
export interface SubmitProblem {
  message: string
  fields?: FieldError[]
}

export interface SubmitSteps {
  api: Pick<ApiClient, 'createPaymentSession'>
  /** Stripe's `elements.submit()`: checks the card field. Returns its error message, if any. */
  checkCard: () => Promise<string | null>
  /** Confirms the payment with the gateway. Resolves to null when the browser is redirecting. */
  confirm: (session: PaymentSession) => Promise<ConfirmError | null>
}

export function confirmMessage(failure: ConfirmError): string {
  switch (failure.reason) {
    case 'declined':
      return 'Tu banco rechazó la tarjeta y no se hizo ningún cargo. Prueba con otra tarjeta.'
    case 'authentication':
      return 'No se completó la verificación de tu tarjeta, así que no se hizo ningún cargo. Puedes intentarlo de nuevo.'
    case 'card':
      return failure.stripeMessage ?? 'Revisa los datos de tu tarjeta.'
    case 'unknown':
      return 'No se pudo completar el pago y no se hizo ningún cargo. Inténtalo de nuevo.'
  }
}

/**
 * The payment path (architecture.md, payment flow, steps 2 to 5):
 * check the form and the card, ask Salesforce for a payment session, then
 * confirm the card with Stripe. Nothing is charged before the last step.
 */
export async function submitDonation(request: PaymentSessionRequest, steps: SubmitSteps): Promise<SubmitProblem | null> {
  // Stripe asks for elements.submit() before any other async work.
  const cardError = await steps.checkCard()
  const fields = validatePaymentSession(request)
  if (fields.length > 0) return { message: errorMessage('VALIDATION_FAILED'), fields }
  if (cardError) return { message: cardError }

  let session: PaymentSession
  try {
    session = await steps.api.createPaymentSession(request)
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    return { message: errorMessage(error.code), fields: error.fields }
  }

  let failure: ConfirmError | null
  try {
    failure = await steps.confirm(session)
  } catch (error) {
    console.error(error)
    failure = { reason: 'unknown' }
  }
  return failure ? { message: confirmMessage(failure) } : null
}
