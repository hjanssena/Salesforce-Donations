import { loadStripe, type Appearance, type Stripe } from '@stripe/stripe-js'

let pending: Promise<Stripe | null> | undefined
let pendingKey = ''

/**
 * Loads Stripe.js once, and only when the donor reaches the payment step, so
 * the campaign page never waits on it. Test keys only (M1), checked in config.
 */
export function getStripe(publishableKey: string): Promise<Stripe | null> {
  if (!pending || pendingKey !== publishableKey) {
    pendingKey = publishableKey
    pending = loadStripe(publishableKey, { locale: 'es-419' })
  }
  return pending
}

/** The card field painted like the rest of the board: flat, square, 2px enamel line. */
export const appearance: Appearance = {
  theme: 'flat',
  variables: {
    colorPrimary: '#1f2f6b',
    colorBackground: '#ffffff',
    colorText: '#15120e',
    colorTextSecondary: '#5a5045',
    colorDanger: '#b23a1e',
    fontFamily: 'Lexend, system-ui, sans-serif',
    fontSizeBase: '16px',
    borderRadius: '0px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: '2px solid #15120e', boxShadow: 'none', padding: '12px' },
    '.Input:focus': { border: '2px solid #1f2f6b', boxShadow: '0 0 0 2px #1f2f6b' },
    '.Input--invalid': { border: '2px solid #b23a1e', boxShadow: 'none' },
    '.Label': { fontWeight: '700', color: '#15120e' },
  },
}

export const fonts = [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap' }]
