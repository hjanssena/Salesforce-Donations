import type { PaymentSessionRequest, TaxpayerType } from '../api/types'

/** What the donor typed, before it becomes a contract request. */
export interface DonorDetails {
  isAnonymous: boolean
  publicName: string
  donorEmail: string
  wantsInvoice: boolean
  invoice: {
    taxpayerType: TaxpayerType | ''
    fullName: string
    rfc: string
    postalCode: string
    taxRegime: string
    cfdiUse: string
    /** Empty means "send it to my donor email". */
    email: string
  }
}

export const emptyDetails: DonorDetails = {
  isAnonymous: false,
  publicName: '',
  donorEmail: '',
  wantsInvoice: false,
  invoice: { taxpayerType: '', fullName: '', rfc: '', postalCode: '', taxRegime: '', cfdiUse: 'D04', email: '' },
}

/**
 * Builds the POST /payment-sessions body. Recognition and invoice stay
 * independent: an anonymous donor never sends a name, and a donor without
 * an invoice never sends tax data.
 */
export function buildRequest(campaignId: string, amount: number, details: DonorDetails): PaymentSessionRequest {
  const donorEmail = details.donorEmail.trim()
  const request: PaymentSessionRequest = {
    campaignId,
    amount,
    donorEmail,
    isAnonymous: details.isAnonymous,
  }
  if (!details.isAnonymous) request.publicName = details.publicName.trim()
  if (details.wantsInvoice) {
    const invoice = details.invoice
    request.invoice = {
      fullName: invoice.fullName.trim(),
      rfc: invoice.rfc.trim().toUpperCase(),
      taxpayerType: invoice.taxpayerType as TaxpayerType,
      postalCode: invoice.postalCode.trim(),
      taxRegime: invoice.taxRegime,
      cfdiUse: invoice.cfdiUse,
      email: invoice.email.trim() || donorEmail,
    }
  }
  return request
}
