import { describe, expect, it } from 'vitest'
import { ApiError, createApiClient } from './client'
import { MOCK_TRIGGERS, completedCampaign, openCampaign } from './mock/fixtures'
import { createMockFetch } from './mock/mockFetch'
import type { PaymentSessionRequest } from './types'

const BASE = 'https://example.my.salesforce-sites.com/donations/services/apexrest/donations/v1'
const TODAY = '2026-11-05'

const client = (scenario: 'default' | 'no-open' = 'default') =>
  createApiClient(BASE, createMockFetch({ scenario, today: TODAY }))

const request: PaymentSessionRequest = {
  campaignId: openCampaign.id,
  amount: 250,
  donorEmail: 'ana@example.com',
  isAnonymous: false,
  publicName: 'Ana López',
}

async function rejection(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error('Expected the call to fail')
}

describe('campaigns against the mock', () => {
  it('lists open campaigns without supporters, and never ones that have not started', async () => {
    const campaigns = await client().listCampaigns()
    expect(campaigns.map((c) => c.id)).toEqual([openCampaign.id])
    expect(campaigns[0]).not.toHaveProperty('supporters')
  })

  it('lists completed campaigns', async () => {
    const campaigns = await client().listCampaigns('completed')
    expect(campaigns.map((c) => c.id)).toEqual([completedCampaign.id])
  })

  it('returns an empty list when nothing is open', async () => {
    expect(await client('no-open').listCampaigns()).toEqual([])
  })

  it('returns a campaign with its supporters', async () => {
    const campaign = await client().getCampaign(openCampaign.id)
    expect(campaign.raisedAmount).toBe(61250.5)
    expect(campaign.supporters[0]).toEqual({ displayName: 'Ana López', amount: 500 })
  })

  it('answers 404 CAMPAIGN_NOT_FOUND for an unknown or future campaign', async () => {
    for (const id of ['nope', '701Hs00000FuTuReAA']) {
      const error = await rejection(client().getCampaign(id))
      expect([error.status, error.code]).toEqual([404, 'CAMPAIGN_NOT_FOUND'])
    }
  })
})

describe('payment sessions against the mock', () => {
  it('returns a placeholder session', async () => {
    const session = await client().createPaymentSession(request)
    expect(session).toEqual({
      paymentIntentId: 'pi_mock_0001',
      clientSecret: 'pi_mock_0001_secret_mock',
      amount: 250,
      currency: 'mxn',
    })
  })

  it('answers 400 VALIDATION_FAILED with each field', async () => {
    const error = await rejection(client().createPaymentSession({ ...request, amount: 10, publicName: 'spam' }))
    expect([error.status, error.code]).toEqual([400, 'VALIDATION_FAILED'])
    expect(error.fields).toEqual([
      { field: 'amount', code: 'AMOUNT_BELOW_MINIMUM' },
      { field: 'publicName', code: 'BANNED_WORD' },
    ])
  })

  it('answers 404, 409, 502 and 500', async () => {
    const cases: Array<[Partial<PaymentSessionRequest>, number, string]> = [
      [{ campaignId: 'nope' }, 404, 'CAMPAIGN_NOT_FOUND'],
      [{ campaignId: completedCampaign.id }, 409, 'CAMPAIGN_NOT_OPEN'],
      [{ donorEmail: MOCK_TRIGGERS.providerError }, 502, 'PAYMENT_PROVIDER_ERROR'],
      [{ donorEmail: MOCK_TRIGGERS.internalError }, 500, 'INTERNAL_ERROR'],
    ]
    for (const [changes, status, code] of cases) {
      const error = await rejection(client().createPaymentSession({ ...request, ...changes }))
      expect([error.status, error.code]).toEqual([status, code])
    }
  })
})

describe('client errors', () => {
  it('reports a network failure', async () => {
    const offline = createApiClient(BASE, () => Promise.reject(new TypeError('Failed to fetch')))
    expect((await rejection(offline.listCampaigns())).code).toBe('NETWORK_ERROR')
  })

  it('treats a non-contract error body as an internal error', async () => {
    const proxy = createApiClient(BASE, async () => new Response('<html>Bad gateway</html>', { status: 502 }))
    const error = await rejection(proxy.listCampaigns())
    expect([error.status, error.code]).toEqual([502, 'INTERNAL_ERROR'])
  })

  it('sends JSON to the contract path', async () => {
    const calls: Array<[string, RequestInit | undefined]> = []
    const spy = createApiClient(BASE, async (input, init) => {
      calls.push([input, init])
      return Response.json({ paymentIntentId: 'pi_1', clientSecret: 's', amount: 250, currency: 'mxn' })
    })
    await spy.createPaymentSession(request)
    expect(calls[0][0]).toBe(`${BASE}/payment-sessions`)
    expect(calls[0][1]?.method).toBe('POST')
    expect(JSON.parse(calls[0][1]?.body as string)).toEqual(request)
  })
})
