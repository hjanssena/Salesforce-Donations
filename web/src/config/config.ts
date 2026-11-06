/**
 * Runtime configuration.
 *
 * In the Docker image, `/config.js` is written at container start from the
 * environment (see docker/40-app-config.sh), so one image works on any server.
 * In local development, the values come from `VITE_*` variables in `.env.local`.
 * Neither holds a secret: the Stripe publishable key is public by design.
 */
/** `mock` answers in the browser from the contract examples; `salesforce` calls the real API. */
export type ApiMode = 'mock' | 'salesforce'

export interface AppConfig {
  apiMode: ApiMode
  /**
   * Public Salesforce Site URL. The API lives under /services/apexrest/donations/v1.
   * Empty in mock mode, where nothing calls Salesforce.
   */
  sfSiteUrl: string
  /** Stripe publishable key. Test mode only (`pk_test_...`). */
  stripePublishableKey: string
}

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>
  }
}

export class ConfigError extends Error {}

export function readConfig(
  runtime: Partial<AppConfig> | undefined = window.__APP_CONFIG__,
  env: Record<string, string | undefined> = import.meta.env,
): AppConfig {
  const apiMode = runtime?.apiMode || env.VITE_API_MODE || 'salesforce'
  const sfSiteUrl = (runtime?.sfSiteUrl || env.VITE_SF_SITE_URL || '').replace(/\/+$/, '')
  const stripePublishableKey = runtime?.stripePublishableKey || env.VITE_STRIPE_PUBLISHABLE_KEY || ''

  if (apiMode !== 'mock' && apiMode !== 'salesforce') {
    throw new ConfigError('API_MODE must be mock or salesforce.')
  }
  if (apiMode === 'salesforce' && !/^https?:\/\/\S+$/.test(sfSiteUrl)) {
    throw new ConfigError('SF_SITE_URL is missing or is not a URL.')
  }
  // M1: Stripe runs in test mode only. Never accept a live or secret key.
  if (!stripePublishableKey.startsWith('pk_test_')) {
    throw new ConfigError('STRIPE_PUBLISHABLE_KEY must be a test publishable key (pk_test_...).')
  }
  return { apiMode, sfSiteUrl: apiMode === 'mock' ? '' : sfSiteUrl, stripePublishableKey }
}

/** In mock mode the base is a bare path that the mock fetch recognises. */
export function apiBaseUrl(config: Pick<AppConfig, 'sfSiteUrl'>): string {
  return `${config.sfSiteUrl}/services/apexrest/donations/v1`
}
