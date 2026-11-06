import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import type { PaymentSessionRequest } from '../api/types'
import { submitDonation, type SubmitSteps } from './submit'

const request: PaymentSessionRequest = { campaignId: 'c1', amount: 250, donorEmail: 'ana@example.com', isAnonymous: true }
const session = { paymentIntentId: 'pi_1', clientSecret: 'pi_1_secret_x', amount: 250, currency: 'mxn' as const }

function steps(overrides: Partial<SubmitSteps> = {}): SubmitSteps {
  return {
    api: { createPaymentSession: vi.fn(async () => session) },
    checkCard: vi.fn(async () => null),
    confirm: vi.fn(async () => null),
    ...overrides,
  }
}

describe('submitDonation', () => {
  it('checks the card, starts a session, then confirms with its secret', async () => {
    const s = steps()
    expect(await submitDonation(request, s)).toBeNull()
    expect(s.checkCard).toHaveBeenCalledOnce()
    expect(s.api.createPaymentSession).toHaveBeenCalledWith(request)
    expect(s.confirm).toHaveBeenCalledWith(session)
  })

  it('stops before the API when the form or the card is wrong', async () => {
    const bad = steps()
    const result = await submitDonation({ ...request, donorEmail: '' }, bad)
    expect(result?.fields).toEqual([{ field: 'donorEmail', code: 'REQUIRED' }])
    expect(bad.api.createPaymentSession).not.toHaveBeenCalled()

    const card = steps({ checkCard: async () => 'El número de tarjeta está incompleto.' })
    expect(await submitDonation(request, card)).toEqual({ message: 'El número de tarjeta está incompleto.' })
    expect(card.api.createPaymentSession).not.toHaveBeenCalled()
  })

  it('maps API errors to Spanish and never confirms', async () => {
    const s = steps({
      api: { createPaymentSession: async () => Promise.reject(new ApiError(409, 'CAMPAIGN_NOT_OPEN', 'ended')) },
    })
    expect((await submitDonation(request, s))?.message).toBe('Esta campaña ya no recibe donativos. No se hizo ningún cargo.')
    expect(s.confirm).not.toHaveBeenCalled()
  })

  it('words a declined card, a verification left unfinished, and a crash', async () => {
    const declined = await submitDonation(request, steps({ confirm: async () => ({ reason: 'declined' }) }))
    expect(declined?.message).toMatch(/rechazó la tarjeta/)
    const abandoned = await submitDonation(request, steps({ confirm: async () => ({ reason: 'authentication' }) }))
    expect(abandoned?.message).toMatch(/No se completó la verificación/)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const crashed = await submitDonation(request, steps({ confirm: async () => Promise.reject(new Error('boom')) }))
    expect(crashed?.message).toMatch(/no se hizo ningún cargo/)
  })
})
