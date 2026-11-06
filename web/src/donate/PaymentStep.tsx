import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useMemo, useState } from 'react'
import type { ApiClient } from '../api/client'
import type { PaymentSessionRequest } from '../api/types'
import { validatePaymentSession } from '../api/validation'
import { returnUrl, type PaymentGateway } from '../payment/gateway'
import { appearance, fonts, getStripe } from '../payment/stripe'
import DonationForm from './DonationForm'
import { errorMessage } from './messages'
import { submitDonation } from './submit'

interface Props {
  campaignId: string
  amount: number
  onChangeAmount: () => void
  api: ApiClient
  gateway: PaymentGateway
  publishableKey: string
}

/**
 * The donation form with Stripe's card field in deferred intent mode: the
 * field shows before any PaymentIntent exists, and the clientSecret arrives
 * from Salesforce only when the donor pays (contract, section 5).
 */
export default function PaymentStep({ publishableKey, amount, ...rest }: Props) {
  const stripe = useMemo(() => getStripe(publishableKey), [publishableKey])
  return (
    <Elements
      stripe={stripe}
      options={{
        mode: 'payment',
        amount: Math.round(amount * 100),
        currency: 'mxn',
        // Card only, as the PaymentIntent Salesforce creates (contract, section 4).
        allowedPaymentMethodTypes: ['card'],
        locale: 'es-419',
        appearance,
        fonts,
      }}
    >
      <StripeForm amount={amount} {...rest} />
    </Elements>
  )
}

function StripeForm({ campaignId, amount, onChangeAmount, api, gateway }: Omit<Props, 'publishableKey'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [cardState, setCardState] = useState<'loading' | 'ready' | 'failed'>('loading')

  async function pay(request: PaymentSessionRequest) {
    if (!stripe || !elements || cardState !== 'ready') {
      // Still point out the donor's own fields, so the wait is not wasted.
      const fields = validatePaymentSession(request)
      if (fields.length > 0) return { message: errorMessage('VALIDATION_FAILED'), fields }
      return {
        message:
          cardState === 'failed'
            ? 'No se puede pagar sin el campo de la tarjeta. Recarga la página para intentarlo de nuevo.'
            : 'El campo de la tarjeta aún no está listo. Espera un momento e inténtalo de nuevo.',
      }
    }
    return submitDonation(request, {
      api,
      checkCard: async () => (await elements.submit()).error?.message ?? null,
      confirm: (session) =>
        gateway.confirm({
          stripe,
          elements,
          clientSecret: session.clientSecret,
          paymentIntentId: session.paymentIntentId,
          amount: session.amount,
          returnUrl: returnUrl(),
        }),
    })
  }

  const cardField = (
    <>
      {cardState === 'loading' && <p className="field__hint">Cargando el campo seguro de Stripe…</p>}
      {cardState === 'failed' ? (
        <p className="field__error" role="alert">
          No pudimos cargar el campo de la tarjeta. Recarga la página para intentarlo de nuevo.
        </p>
      ) : (
        <PaymentElement
          options={{ layout: 'tabs', wallets: { applePay: 'never', googlePay: 'never', link: 'never' } }}
          onReady={() => setCardState('ready')}
          onLoadError={(event) => {
            console.error(event.error)
            setCardState('failed')
          }}
        />
      )}
    </>
  )

  return (
    <DonationForm campaignId={campaignId} amount={amount} onChangeAmount={onChangeAmount} cardField={cardField} onPay={pay} />
  )
}
