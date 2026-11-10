import { useEffect, useState } from 'react'
import type { PaymentGateway, PaymentRecord } from '../payment/gateway'
import { getStripe } from '../payment/stripe'
import { thanksWording } from './wording'

interface Props {
  gateway: PaymentGateway
  publishableKey: string
  /** The page's query string; Stripe adds the payment to it on return. */
  search?: string
}

type Load = { state: 'loading' } | { state: 'ready'; payment: PaymentRecord | null }

/** After this the line admits the check is slow; after the deadline the page stops waiting. */
const SLOW_MS = 5000
const DEADLINE_MS = 15000

/**
 * Where Stripe sends the donor after paying. It reads the payment's status
 * from Stripe with the donor's own clientSecret, so it can only ever show
 * that donor's payment (RF-D4 CA3), and nothing without one (CA4).
 */
export default function ThankYouPage({ gateway, publishableKey, search = window.location.search }: Props) {
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    let active = true
    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_MS)
    // A check that hangs ends in the honest "we cannot confirm yet" wording, never an endless wait.
    const deadline = window.setTimeout(() => {
      if (!active) return
      active = false
      setLoad({ state: 'ready', payment: null })
    }, DEADLINE_MS)
    const params = new URLSearchParams(search)
    const paymentIntentId = params.get('payment_intent') ?? ''
    const clientSecret = params.get('payment_intent_client_secret') ?? ''
    ;(async () => {
      let payment: PaymentRecord | null = null
      if (paymentIntentId && clientSecret) {
        try {
          const stripe = await getStripe(publishableKey)
          payment = await gateway.retrieve(stripe, clientSecret, paymentIntentId)
        } catch (error) {
          console.error(error)
        }
      }
      // The answer came first: the deadline and the slow notice must not overwrite it.
      window.clearTimeout(deadline)
      window.clearTimeout(slowTimer)
      if (active) setLoad({ state: 'ready', payment })
    })()
    return () => {
      active = false
      window.clearTimeout(slowTimer)
      window.clearTimeout(deadline)
    }
  }, [gateway, publishableKey, search])

  // The wait is the thank-you page itself, so the answer only changes the sign and the
  // sentence, and the one status region announces it.
  const checking = load.state === 'loading'
  const wording = checking ? null : thanksWording(load.payment)
  return (
    <main className="unavailable thanks-page" aria-busy={checking}>
      <div className="notice" role="status">
        <p className="signature">SF Vibe Lab · Mérida</p>
        <h1 className="sign">{wording ? wording.title : 'Un momento'}</h1>
        <p className="notice__text">
          {wording
            ? wording.text
            : slow
              ? 'Sigue revisando tu pago… la conexión está lenta. No cierres esta página.'
              : 'Revisando tu pago. No cierres esta página.'}
        </p>
        {checking && <span className="waiting__brush" aria-hidden="true" />}
      </div>
      {wording && (
        <a className="sign-button notice__retry thanks-page__back" href="/">
          {wording.retry ? 'Volver a la campaña' : 'Ver la campaña'}
        </a>
      )}
    </main>
  )
}
