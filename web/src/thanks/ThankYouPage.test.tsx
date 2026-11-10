import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PaymentGateway, PaymentRecord } from '../payment/gateway'
import ThankYouPage from './ThankYouPage'
import { thanksWording } from './wording'

vi.mock('../payment/stripe', () => ({ getStripe: async () => null }))

const gatewayWith = (payment: PaymentRecord | null): PaymentGateway => ({
  confirm: async () => null,
  retrieve: vi.fn(async () => payment),
})

const RETURN = '?payment_intent=pi_1&payment_intent_client_secret=pi_1_secret_x&redirect_status=succeeded'

describe('ThankYouPage (RF-D4)', () => {
  it('thanks the donor without claiming the donation is confirmed', async () => {
    render(<ThankYouPage gateway={gatewayWith({ status: 'succeeded', amount: 250 })} publishableKey="pk_test_1" search={RETURN} />)
    expect(await screen.findByRole('heading', { name: '¡Gracias!' })).toBeInTheDocument()
    const text = screen.getByText(/Tu pago de \$250 se realizó/).textContent ?? ''
    expect(text).toMatch(/Estamos registrando/)
    expect(text).not.toMatch(/confirmad|registrado/i)
  })

  it('claims no donation when opened without a payment', async () => {
    const gateway = gatewayWith({ status: 'succeeded', amount: 250 })
    render(<ThankYouPage gateway={gateway} publishableKey="pk_test_1" search="" />)
    expect(await screen.findByRole('heading', { name: 'Sin pago a la vista' })).toBeInTheDocument()
    expect(gateway.retrieve).not.toHaveBeenCalled()
    expect(screen.queryByText(/Gracias/)).not.toBeInTheDocument()
  })

  it('reads only the payment named in its own address', async () => {
    const gateway = gatewayWith(null)
    render(<ThankYouPage gateway={gateway} publishableKey="pk_test_1" search={RETURN} />)
    await screen.findByRole('heading', { name: 'Sin pago a la vista' })
    expect(gateway.retrieve).toHaveBeenCalledWith(null, 'pi_1_secret_x', 'pi_1')
  })
})

describe('thanksWording', () => {
  it('words each status', () => {
    expect(thanksWording({ status: 'processing', amount: 100 }).title).toBe('Tu pago está en proceso')
    expect(thanksWording({ status: 'requires_payment_method', amount: 100 })).toMatchObject({
      title: 'El pago no se completó',
      retry: true,
    })
    expect(thanksWording({ status: 'requires_action', amount: 100 }).text).toMatch(/no se hizo ningún cargo/)
    expect(thanksWording({ status: 'canceled', amount: 100 }).text).toMatch(/No se hizo ningún cargo/)
  })

  it('waits as the thank-you page itself, and never forever', async () => {
    vi.useFakeTimers()
    try {
      const gateway: PaymentGateway = { confirm: async () => null, retrieve: () => new Promise(() => {}) }
      render(<ThankYouPage gateway={gateway} publishableKey="pk_test_1" search={RETURN} />)
      expect(screen.getByRole('heading', { name: 'Un momento' })).toBeInTheDocument()
      expect(screen.getByText(/Revisando tu pago\. No cierres esta página/)).toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })
      expect(screen.getByText(/la conexión está lenta/)).toBeInTheDocument()
      await act(async () => {
        vi.advanceTimersByTime(10000)
      })
      expect(screen.getByRole('heading', { name: thanksWording(null).title })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
