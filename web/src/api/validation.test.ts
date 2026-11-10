import { describe, expect, it } from 'vitest'
import type { PaymentSessionRequest } from './types'
import { containsBannedWord, validatePaymentSession } from './validation'

// The request example from docs/contract.md, section 3.
const contractExample: PaymentSessionRequest = {
  campaignId: '701Hs00000AbCdEFGH',
  amount: 250,
  donorEmail: 'ana@example.com',
  isAnonymous: false,
  publicName: 'Ana López',
  invoice: {
    fullName: 'Ana María López Pérez',
    rfc: 'LOPA800101ABC',
    taxpayerType: 'individual',
    postalCode: '97000',
    taxRegime: '612',
    cfdiUse: 'D04',
    email: 'ana@example.com',
  },
}

const anonymous: PaymentSessionRequest = {
  campaignId: '701Hs00000AbCdEFGH',
  amount: 100,
  donorEmail: 'anon@example.com',
  isAnonymous: true,
}

const codes = (request: unknown, banned: string[] = []) =>
  validatePaymentSession(request, banned).map((e) => `${e.field}:${e.code}`)

describe('validatePaymentSession', () => {
  it('accepts the contract example', () => {
    expect(codes(contractExample)).toEqual([])
  })

  it('accepts an anonymous donation without invoice, and a null invoice', () => {
    expect(codes(anonymous)).toEqual([])
    expect(codes({ ...anonymous, invoice: null })).toEqual([])
  })

  it('reports every missing required field', () => {
    expect(codes({})).toEqual(['campaignId:REQUIRED', 'amount:REQUIRED', 'donorEmail:REQUIRED', 'isAnonymous:REQUIRED'])
  })

  it('applies the amount rules', () => {
    expect(codes({ ...anonymous, amount: 50 })).toEqual([])
    expect(codes({ ...anonymous, amount: 250.5 })).toEqual([])
    expect(codes({ ...anonymous, amount: 1000000 })).toEqual([])
    expect(codes({ ...anonymous, amount: 49.99 })).toEqual(['amount:AMOUNT_BELOW_MINIMUM'])
    expect(codes({ ...anonymous, amount: 100.005 })).toEqual(['amount:INVALID_FORMAT'])
    expect(codes({ ...anonymous, amount: '250' })).toEqual(['amount:INVALID_FORMAT'])
  })

  it('checks the donor email', () => {
    expect(codes({ ...anonymous, donorEmail: 'not-an-email' })).toEqual(['donorEmail:INVALID_FORMAT'])
    expect(codes({ ...anonymous, donorEmail: `${'a'.repeat(250)}@x.mx` })).toEqual(['donorEmail:TOO_LONG'])
  })

  it('requires a public name only when credited', () => {
    expect(codes({ ...contractExample, publicName: undefined })).toEqual(['publicName:REQUIRED'])
    expect(codes({ ...contractExample, publicName: '   ' })).toEqual(['publicName:REQUIRED'])
    expect(codes({ ...contractExample, publicName: 'x'.repeat(81) })).toEqual(['publicName:TOO_LONG'])
    expect(codes({ ...contractExample, publicName: 'Ñ'.repeat(80) })).toEqual([])
    expect(codes({ ...anonymous, publicName: 'Ana' })).toEqual(['publicName:NOT_ALLOWED'])
    expect(codes({ ...anonymous, publicName: null })).toEqual(['publicName:NOT_ALLOWED'])
    expect(codes({ ...anonymous, publicName: '' })).toEqual(['publicName:NOT_ALLOWED'])
  })

  it('reports a banned word in the public name', () => {
    expect(codes({ ...contractExample, publicName: 'Mucho SPAM aquí' }, ['spam'])).toEqual(['publicName:BANNED_WORD'])
    expect(codes({ ...contractExample, publicName: 'Spamalot' }, ['spam'])).toEqual([])
  })

  it('checks the RFC against the pattern and the taxpayer type', () => {
    const invoice = contractExample.invoice!
    const withInvoice = (changes: object) => ({ ...contractExample, invoice: { ...invoice, ...changes } })
    expect(codes(withInvoice({ rfc: 'lopa800101abc' }))).toEqual(['invoice.rfc:INVALID_FORMAT'])
    // A 12-character RFC belongs to a company.
    expect(codes(withInvoice({ rfc: 'EEJ800101AB1' }))).toEqual(['invoice.rfc:INVALID_FORMAT'])
    expect(codes(withInvoice({ rfc: 'EEJ800101AB1', taxpayerType: 'company' }))).toEqual([])
    expect(codes(withInvoice({ rfc: 'ÑÑO800101AB1', taxpayerType: 'company' }))).toEqual([])
    expect(codes(withInvoice({ taxpayerType: 'person' }))).toEqual(['invoice.taxpayerType:INVALID_FORMAT'])
  })

  it('checks the rest of the invoice', () => {
    const invoice = contractExample.invoice!
    const withInvoice = (changes: object) => ({ ...contractExample, invoice: { ...invoice, ...changes } })
    expect(codes(withInvoice({ postalCode: '9700' }))).toEqual(['invoice.postalCode:INVALID_FORMAT'])
    expect(codes(withInvoice({ taxRegime: '999' }))).toEqual(['invoice.taxRegime:INVALID_FORMAT'])
    expect(codes(withInvoice({ cfdiUse: 'P01' }))).toEqual(['invoice.cfdiUse:INVALID_FORMAT'])
    expect(codes(withInvoice({ email: '' }))).toEqual(['invoice.email:REQUIRED'])
    expect(codes(withInvoice({ fullName: 'x'.repeat(151) }))).toEqual(['invoice.fullName:TOO_LONG'])
    expect(codes({ ...contractExample, invoice: {} })).toEqual([
      'invoice.fullName:REQUIRED',
      'invoice.taxpayerType:REQUIRED',
      'invoice.rfc:REQUIRED',
      'invoice.postalCode:REQUIRED',
      'invoice.taxRegime:REQUIRED',
      'invoice.cfdiUse:REQUIRED',
      'invoice.email:REQUIRED',
    ])
  })
})

describe('containsBannedWord', () => {
  it('ignores case and accents and matches whole words', () => {
    expect(containsBannedWord('Una Grosería', ['groseria'])).toBe(true)
    expect(containsBannedWord('Groserías', ['groseria'])).toBe(false)
  })

  it('splits on whitespace only, so punctuation stays part of the word', () => {
    expect(containsBannedWord('Ana\tSPAM\nLópez', ['spam'])).toBe(true)
    expect(containsBannedWord('  spam  ', ['spam'])).toBe(true)
    expect(containsBannedWord('spam!', ['spam'])).toBe(false)
    expect(containsBannedWord('Ana-spam', ['spam'])).toBe(false)
    expect(containsBannedWord('Spamalot', ['spam'])).toBe(false)
  })
})
