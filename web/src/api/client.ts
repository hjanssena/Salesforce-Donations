import type {
  Campaign,
  CampaignDetail,
  CampaignList,
  CampaignStatus,
  ErrorBody,
  ErrorCode,
  FieldError,
  PaymentSession,
  PaymentSessionRequest,
} from './types'

/** `NETWORK_ERROR` and `BAD_RESPONSE` are client-side: the API never sends them. */
export type ClientErrorCode = ErrorCode | 'NETWORK_ERROR' | 'BAD_RESPONSE'

export class ApiError extends Error {
  readonly status: number
  readonly code: ClientErrorCode
  readonly fields: FieldError[]

  constructor(status: number, code: ClientErrorCode, message: string, fields: FieldError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export interface ApiClient {
  listCampaigns(status?: CampaignStatus): Promise<Campaign[]>
  getCampaign(id: string): Promise<CampaignDetail>
  createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSession>
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

const KNOWN_CODES: ReadonlySet<string> = new Set<ErrorCode>([
  'VALIDATION_FAILED',
  'CAMPAIGN_NOT_FOUND',
  'CAMPAIGN_NOT_OPEN',
  'PAYMENT_PROVIDER_ERROR',
  'INTERNAL_ERROR',
])

function isErrorBody(value: unknown): value is ErrorBody {
  if (typeof value !== 'object' || value === null) return false
  const error = (value as { error?: unknown }).error
  return typeof error === 'object' && error !== null && typeof (error as { code?: unknown }).code === 'string'
}

/**
 * The contract API (docs/contract.md). `baseUrl` is
 * `{SF_SITE_URL}/services/apexrest/donations/v1`; `fetchImpl` is the browser's
 * fetch, or the mock API's in mock mode.
 */
export function createApiClient(baseUrl: string, fetchImpl: FetchLike): ApiClient {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        ...init,
        headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
      })
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', 'The API could not be reached.')
    }

    let body: unknown
    try {
      body = await response.json()
    } catch {
      body = undefined
    }

    if (!response.ok) {
      if (isErrorBody(body)) {
        const { code, message, fields } = body.error
        // An unknown code is treated as an internal error rather than trusted.
        const known = KNOWN_CODES.has(code) ? code : 'INTERNAL_ERROR'
        throw new ApiError(response.status, known, message, Array.isArray(fields) ? fields : [])
      }
      throw new ApiError(response.status, 'INTERNAL_ERROR', `HTTP ${response.status}`)
    }
    if (body === undefined) throw new ApiError(response.status, 'BAD_RESPONSE', 'The response was not JSON.')
    return body as T
  }

  return {
    async listCampaigns(status = 'open') {
      const { campaigns } = await request<CampaignList>(`/campaigns?status=${status}`)
      if (!Array.isArray(campaigns)) throw new ApiError(200, 'BAD_RESPONSE', 'campaigns is not a list.')
      return campaigns
    },
    getCampaign(id) {
      return request<CampaignDetail>(`/campaigns/${encodeURIComponent(id)}`)
    },
    createPaymentSession(body) {
      return request<PaymentSession>('/payment-sessions', { method: 'POST', body: JSON.stringify(body) })
    },
  }
}
