import type { Stripe, StripeElements } from '@stripe/stripe-js'
import { describe, expect, it, vi } from 'vitest'
import { createMockGateway } from './gateway'

function memoryStorage() {
  const data = new Map<string, string>()
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) }
}

const stripeWithCard = (last4: string) =>
  ({ createPaymentMethod: async () => ({ paymentMethod: { card: { last4 } } }) }) as unknown as Stripe

const args = (stripe: Stripe) => ({
  stripe,
  elements: {} as StripeElements,
  paymentIntentId: 'pi_mock_0001',
  clientSecret: 'pi_mock_0001_secret_mock',
  amount: 250,
  returnUrl: 'https://site.test/gracias',
})

describe('mock gateway', () => {
  it('fakes success with a good test card and returns like Stripe does', async () => {
    const storage = memoryStorage()
    const navigate = vi.fn()
    const gateway = createMockGateway(storage, navigate)
    expect(await gateway.confirm(args(stripeWithCard('4242')))).toBeNull()
    expect(navigate).toHaveBeenCalledWith(
      'https://site.test/gracias?payment_intent=pi_mock_0001&payment_intent_client_secret=pi_mock_0001_secret_mock&redirect_status=succeeded',
    )
    expect(await gateway.retrieve(null, 'pi_mock_0001_secret_mock', 'pi_mock_0001')).toEqual({ status: 'succeeded', amount: 250 })
  })

  it('declines Stripe decline cards and stops 3D Secure cards, without leaving the page', async () => {
    const navigate = vi.fn()
    const gateway = createMockGateway(memoryStorage(), navigate)
    expect(await gateway.confirm(args(stripeWithCard('0002')))).toEqual({ reason: 'declined' })
    expect(await gateway.confirm(args(stripeWithCard('3155')))).toEqual({ reason: 'authentication' })
    expect(navigate).not.toHaveBeenCalled()
  })

  it('passes card input errors through', async () => {
    const stripe = {
      createPaymentMethod: async () => ({ error: { type: 'validation_error', message: 'Tarjeta incompleta.' } }),
    } as unknown as Stripe
    expect(await createMockGateway(memoryStorage(), vi.fn()).confirm(args(stripe))).toEqual({
      reason: 'card',
      stripeMessage: 'Tarjeta incompleta.',
    })
  })

  it('knows no payment for a secret that is not the intent’s', async () => {
    const storage = memoryStorage()
    const gateway = createMockGateway(storage, vi.fn())
    await gateway.confirm(args(stripeWithCard('4242')))
    expect(await gateway.retrieve(null, 'pi_mock_0002_secret_mock', 'pi_mock_0001')).toBeNull()
    expect(await gateway.retrieve(null, 'pi_mock_0009_secret_mock', 'pi_mock_0009')).toBeNull()
  })
})
