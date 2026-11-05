import { describe, expect, it } from 'vitest'
import { ConfigError, apiBaseUrl, readConfig } from './config'

const valid = { sfSiteUrl: 'https://example.my.salesforce-sites.com/donations', stripePublishableKey: 'pk_test_123' }

describe('readConfig', () => {
  it('prefers runtime values over build-time ones', () => {
    const config = readConfig(valid, { VITE_SF_SITE_URL: 'https://other.example', VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_other' })
    expect(config).toEqual(valid)
  })

  it('falls back to VITE_ variables in development', () => {
    const config = readConfig(undefined, { VITE_SF_SITE_URL: 'https://dev.example/', VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_dev' })
    expect(config.sfSiteUrl).toBe('https://dev.example')
  })

  it('rejects a missing site URL', () => {
    expect(() => readConfig({ ...valid, sfSiteUrl: '' }, {})).toThrow(ConfigError)
  })

  it('rejects a live key', () => {
    expect(() => readConfig({ ...valid, stripePublishableKey: 'pk_live_123' }, {})).toThrow(ConfigError)
  })

  it('rejects a secret key', () => {
    expect(() => readConfig({ ...valid, stripePublishableKey: 'sk_test_123' }, {})).toThrow(ConfigError)
  })
})

describe('apiBaseUrl', () => {
  it('builds the contract base URL', () => {
    expect(apiBaseUrl(valid)).toBe('https://example.my.salesforce-sites.com/donations/services/apexrest/donations/v1')
  })
})
