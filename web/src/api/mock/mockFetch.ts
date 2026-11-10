import type { FetchLike } from '../client'
import type { CampaignDetail, ErrorBody, ErrorCode, FieldError, PaymentSession, PaymentSessionRequest } from '../types'
import { validatePaymentSession } from '../validation'
import {
  MOCK_BANNED_WORDS,
  MOCK_TRIGGERS,
  completedCampaign,
  futureCampaign,
  openCampaign,
  secondOpenCampaign,
  shortCompletedCampaign,
} from './fixtures'

/**
 * The contract in executable form (docs/contract.md, section 5): a fetch that
 * answers the three endpoints in the browser, with no server. The web app uses
 * it when API_MODE is `mock`, and the tests use it to check the client.
 *
 * Scenarios, picked with `?mock=` in the page URL:
 * - `default`: one open and one completed campaign.
 * - `many-open`: two open campaigns, for the list of open campaigns.
 * - `no-open`: no open campaign, for the "none open" message.
 * Every scenario has two completed campaigns, one past its goal and one short of it.
 */
export type MockScenario = 'default' | 'many-open' | 'no-open'

export const MOCK_SCENARIOS: readonly MockScenario[] = ['default', 'many-open', 'no-open']

export interface MockOptions {
  scenario?: MockScenario
  /** Fake network delay in ms, so loading states show. */
  delayMs?: number
  /** Today in America/Merida, `YYYY-MM-DD`. Defaults to the real date. */
  today?: string
}

const API_PATH = /\/services\/apexrest\/donations\/v1(\/.*)?$/

export function meridaToday(now = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Merida' }).format(now)
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function error(status: number, code: ErrorCode, message: string, fields?: FieldError[]): Response {
  const body: ErrorBody = { error: { code, message, ...(fields ? { fields } : {}) } }
  return json(status, body)
}

const listItem = ({ supporters: _supporters, ...campaign }: CampaignDetail) => campaign

export function createMockFetch({ scenario = 'default', delayMs = 0, today = meridaToday() }: MockOptions = {}): FetchLike {
  const opened = { default: [openCampaign], 'many-open': [openCampaign, secondOpenCampaign], 'no-open': [] }[scenario]
  const all = [...opened, completedCampaign, shortCompletedCampaign, futureCampaign]
  // Campaigns that have not started are never returned (contract, section 2).
  const started = () => all.filter((c) => c.startDate <= today)
  let sessions = 0

  function campaigns(status: string | null): Response {
    if (status !== null && status !== 'open' && status !== 'completed') {
      return error(400, 'VALIDATION_FAILED', 'One or more fields are invalid.', [{ field: 'status', code: 'INVALID_FORMAT' }])
    }
    const wanted = status ?? 'open'
    const list = started()
      .filter((c) => c.status === wanted)
      // Open: soonest end first. Completed: latest end first.
      .sort((a, b) => (wanted === 'open' ? a.endDate.localeCompare(b.endDate) : b.endDate.localeCompare(a.endDate)))
      .map(listItem)
    return json(200, { campaigns: list })
  }

  function campaign(id: string): Response {
    const found = started().find((c) => c.id === id)
    if (!found) return error(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found.')
    return json(200, found)
  }

  function paymentSession(raw: unknown): Response {
    const fields = validatePaymentSession(raw, MOCK_BANNED_WORDS)
    if (fields.length > 0) return error(400, 'VALIDATION_FAILED', 'One or more fields are invalid.', fields)

    const body = raw as PaymentSessionRequest
    const found = started().find((c) => c.id === body.campaignId)
    if (!found) return error(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found.')
    if (found.status !== 'open') return error(409, 'CAMPAIGN_NOT_OPEN', 'The campaign has ended.')
    if (body.donorEmail === MOCK_TRIGGERS.providerError) {
      return error(502, 'PAYMENT_PROVIDER_ERROR', 'The payment provider could not create the payment.')
    }
    if (body.donorEmail === MOCK_TRIGGERS.internalError) return error(500, 'INTERNAL_ERROR', 'Internal error.')

    // Placeholder values, like Salesforce returns in E1. Stripe.js cannot use them.
    sessions += 1
    const paymentIntentId = `pi_mock_${String(sessions).padStart(4, '0')}`
    const session: PaymentSession = {
      paymentIntentId,
      clientSecret: `${paymentIntentId}_secret_mock`,
      amount: body.amount,
      currency: 'mxn',
    }
    return json(200, session)
  }

  function route(input: string, init?: RequestInit): Response {
    const url = new URL(input, 'http://mock.invalid')
    const match = API_PATH.exec(url.pathname)
    const path = match?.[1] ?? ''
    const method = (init?.method ?? 'GET').toUpperCase()

    if (match && path === '/campaigns' && method === 'GET') return campaigns(url.searchParams.get('status'))

    const detail = /^\/campaigns\/([^/]+)$/.exec(path)
    if (match && detail && method === 'GET') return campaign(decodeURIComponent(detail[1]))

    if (match && path === '/payment-sessions' && method === 'POST') {
      let body: unknown
      try {
        body = JSON.parse(typeof init?.body === 'string' ? init.body : '')
      } catch {
        return error(400, 'VALIDATION_FAILED', 'The body is not valid JSON.', [])
      }
      return paymentSession(body)
    }

    return error(404, 'INTERNAL_ERROR', `No mock for ${method} ${url.pathname}`)
  }

  return async (input, init) => {
    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs))
    return route(input, init)
  }
}
