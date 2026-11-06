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

/**
 * Where Stripe sends the donor after paying. It reads the payment's status
 * from Stripe with the donor's own clientSecret, so it can only ever show
 * that donor's payment (RF-D4 CA3), and nothing without one (CA4).
 */
export default function ThankYouPage({ gateway, publishableKey, search = window.location.search }: Props) {
  const [load, setLoad] = useState<Load>({ state: 'loading' })

  useEffect(() => {
    let active = true
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
      if (active) setLoad({ state: 'ready', payment })
    })()
    return () => {
      active = false
    }
  }, [gateway, publishableKey, search])

  if (load.state === 'loading') {
    return (
      <main className="unavailable">
        <p role="status" className="notice__text">
          Revisando tu pago…
        </p>
      </main>
    )
  }

  const wording = thanksWording(load.payment)
  return (
    <main className="unavailable thanks-page">
      <div className="notice" role="status">
        <p className="signature">SF Vibe Lab · Mérida</p>
        <h1 className="sign">{wording.title}</h1>
        <p className="notice__text">{wording.text}</p>
      </div>
      <a className="sign-button notice__retry thanks-page__back" href="/">
        {wording.retry ? 'Volver a la campaña' : 'Ver la campaña'}
      </a>
    </main>
  )
}
