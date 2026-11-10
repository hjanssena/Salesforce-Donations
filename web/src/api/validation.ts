import { CFDI_USES, TAX_REGIMES } from './catalogs'
import type { FieldError } from './types'

/**
 * The request rules for POST /payment-sessions (docs/contract.md, section 3).
 * Salesforce is the authority; the web app runs the same rules first so the
 * donor sees errors before sending, and the mock API uses them to answer.
 *
 * Banned words live in Salesforce. The browser does not know them, so it
 * passes none and only the server (or the mock) reports BANNED_WORD.
 */

export const MIN_AMOUNT = 50
export const MAX_EMAIL_LENGTH = 254
export const MAX_PUBLIC_NAME_LENGTH = 80
export const MAX_FULL_NAME_LENGTH = 150

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RFC = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/
const POSTAL_CODE = /^[0-9]{5}$/
const RFC_LENGTH = { individual: 13, company: 12 } as const

const TAX_REGIME_CODES: ReadonlySet<string> = new Set(TAX_REGIMES.map((r) => r.code))
const CFDI_USE_CODES: ReadonlySet<string> = new Set(CFDI_USES.map((u) => u.code))

/** Length in characters, so "Ñ" or an emoji counts once. */
const length = (value: string) => [...value].length

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** At most 2 decimals, allowing for binary rounding (0.1 + 0.2). */
function hasAtMostTwoDecimals(amount: number): boolean {
  const cents = amount * 100
  return Math.abs(cents - Math.round(cents)) < 1e-6
}

/** Lowercase without accents, so "Grosería" and "groseria" match. */
function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/**
 * Splits the text on whitespace only and compares each piece with each banned
 * word as a whole word (docs/contract.md, section 3). Punctuation stays part of
 * the piece, so "spam!" does not match "spam".
 */
export function containsBannedWord(text: string, bannedWords: readonly string[]): boolean {
  const words = new Set(fold(text).split(/\s+/u).filter(Boolean))
  return bannedWords.some((word) => words.has(fold(word)))
}

function checkEmail(field: string, value: unknown, errors: FieldError[]) {
  if (typeof value !== 'string' || value.trim() === '') errors.push({ field, code: 'REQUIRED' })
  else if (length(value) > MAX_EMAIL_LENGTH) errors.push({ field, code: 'TOO_LONG' })
  else if (!EMAIL.test(value)) errors.push({ field, code: 'INVALID_FORMAT' })
}

function checkText(field: string, value: unknown, max: number, errors: FieldError[]): value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push({ field, code: 'REQUIRED' })
    return false
  }
  if (length(value) > max) {
    errors.push({ field, code: 'TOO_LONG' })
    return false
  }
  return true
}

function checkInvoice(invoice: unknown, errors: FieldError[]) {
  if (!isObject(invoice)) {
    errors.push({ field: 'invoice', code: 'INVALID_FORMAT' })
    return
  }

  checkText('invoice.fullName', invoice.fullName, MAX_FULL_NAME_LENGTH, errors)

  const type = invoice.taxpayerType
  const typeValid = type === 'individual' || type === 'company'
  if (type === undefined || type === null || type === '') errors.push({ field: 'invoice.taxpayerType', code: 'REQUIRED' })
  else if (!typeValid) errors.push({ field: 'invoice.taxpayerType', code: 'INVALID_FORMAT' })

  const rfc = invoice.rfc
  if (typeof rfc !== 'string' || rfc === '') errors.push({ field: 'invoice.rfc', code: 'REQUIRED' })
  else if (!RFC.test(rfc)) errors.push({ field: 'invoice.rfc', code: 'INVALID_FORMAT' })
  // The RFC length must match the taxpayer type: 13 for a person, 12 for a company.
  else if (typeValid && length(rfc) !== RFC_LENGTH[type]) errors.push({ field: 'invoice.rfc', code: 'INVALID_FORMAT' })

  const postalCode = invoice.postalCode
  if (typeof postalCode !== 'string' || postalCode === '') errors.push({ field: 'invoice.postalCode', code: 'REQUIRED' })
  else if (!POSTAL_CODE.test(postalCode)) errors.push({ field: 'invoice.postalCode', code: 'INVALID_FORMAT' })

  const regime = invoice.taxRegime
  if (typeof regime !== 'string' || regime === '') errors.push({ field: 'invoice.taxRegime', code: 'REQUIRED' })
  else if (!TAX_REGIME_CODES.has(regime)) errors.push({ field: 'invoice.taxRegime', code: 'INVALID_FORMAT' })

  const use = invoice.cfdiUse
  if (typeof use !== 'string' || use === '') errors.push({ field: 'invoice.cfdiUse', code: 'REQUIRED' })
  else if (!CFDI_USE_CODES.has(use)) errors.push({ field: 'invoice.cfdiUse', code: 'INVALID_FORMAT' })

  checkEmail('invoice.email', invoice.email, errors)
}

/**
 * Checks a payment session request. Returns one error per broken field,
 * in request order; an empty list means the request is valid.
 */
export function validatePaymentSession(request: unknown, bannedWords: readonly string[] = []): FieldError[] {
  const errors: FieldError[] = []
  const body = isObject(request) ? request : {}

  if (typeof body.campaignId !== 'string' || body.campaignId === '') errors.push({ field: 'campaignId', code: 'REQUIRED' })

  const amount = body.amount
  if (amount === undefined || amount === null) errors.push({ field: 'amount', code: 'REQUIRED' })
  else if (typeof amount !== 'number' || !Number.isFinite(amount)) errors.push({ field: 'amount', code: 'INVALID_FORMAT' })
  else if (amount < MIN_AMOUNT) errors.push({ field: 'amount', code: 'AMOUNT_BELOW_MINIMUM' })
  else if (!hasAtMostTwoDecimals(amount)) errors.push({ field: 'amount', code: 'INVALID_FORMAT' })

  checkEmail('donorEmail', body.donorEmail, errors)

  const anonymous = body.isAnonymous
  if (typeof anonymous !== 'boolean') {
    errors.push({ field: 'isAnonymous', code: anonymous === undefined || anonymous === null ? 'REQUIRED' : 'INVALID_FORMAT' })
  } else if (anonymous) {
    // The contract says absent, so the key is refused even when it holds null.
    if (body.publicName !== undefined) errors.push({ field: 'publicName', code: 'NOT_ALLOWED' })
  } else if (checkText('publicName', body.publicName, MAX_PUBLIC_NAME_LENGTH, errors)) {
    if (containsBannedWord(body.publicName as string, bannedWords)) errors.push({ field: 'publicName', code: 'BANNED_WORD' })
  }

  if (body.invoice !== undefined && body.invoice !== null) checkInvoice(body.invoice, errors)

  return errors
}
