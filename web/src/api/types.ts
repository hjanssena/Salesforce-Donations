// Shapes from docs/contract.md, section 2. Field names match the API exactly.

export type CampaignStatus = 'open' | 'completed'

export interface Campaign {
  id: string
  name: string
  description: string
  purpose: string
  imageUrl?: string | null
  goalAmount: number
  raisedAmount: number
  startDate: string // YYYY-MM-DD, America/Merida
  endDate: string // YYYY-MM-DD, America/Merida
  status: CampaignStatus
}

export interface Supporter {
  displayName: string
  amount: number
}

export interface CampaignDetail extends Campaign {
  /** Credited, visible supporters only. Newest first. */
  supporters: Supporter[]
}

export interface CampaignList {
  campaigns: Campaign[]
}

// Section 3: payment session.

export type TaxpayerType = 'individual' | 'company'

export interface InvoiceRequest {
  fullName: string
  rfc: string
  taxpayerType: TaxpayerType
  postalCode: string
  taxRegime: string
  cfdiUse: string
  email: string
}

export interface PaymentSessionRequest {
  campaignId: string
  amount: number
  donorEmail: string
  isAnonymous: boolean
  /** Required when credited; must be absent when anonymous. */
  publicName?: string
  /** Absent or null means no invoice. */
  invoice?: InvoiceRequest | null
}

export interface PaymentSession {
  paymentIntentId: string
  clientSecret: string
  amount: number
  currency: 'mxn'
}

// Errors. Every error response has this shape.

export type ErrorCode =
  | 'VALIDATION_FAILED'
  | 'CAMPAIGN_NOT_FOUND'
  | 'CAMPAIGN_NOT_OPEN'
  | 'PAYMENT_PROVIDER_ERROR'
  | 'INTERNAL_ERROR'

export type FieldErrorCode =
  | 'REQUIRED'
  | 'INVALID_FORMAT'
  | 'TOO_LONG'
  | 'AMOUNT_BELOW_MINIMUM'
  | 'BANNED_WORD'
  | 'NOT_ALLOWED'

export interface FieldError {
  /** Dotted path, e.g. `amount` or `invoice.rfc`. */
  field: string
  code: FieldErrorCode
}

export interface ErrorBody {
  error: {
    code: ErrorCode
    message: string
    fields?: FieldError[]
  }
}
