import { apiBaseUrl, type AppConfig } from '../config/config'
import { createApiClient, type ApiClient } from './client'
import { createMockFetch, type MockScenario } from './mock/mockFetch'

export { ApiError, type ApiClient } from './client'

/**
 * The API the app talks to. API_MODE picks the real Salesforce site or the
 * in-browser mock; nothing else in the app knows the difference.
 */
export function createApi(config: AppConfig, search = window.location.search): ApiClient {
  if (config.apiMode === 'mock') {
    const scenario: MockScenario = new URLSearchParams(search).get('mock') === 'no-open' ? 'no-open' : 'default'
    return createApiClient(apiBaseUrl(config), createMockFetch({ scenario, delayMs: 400 }))
  }
  return createApiClient(apiBaseUrl(config), (input, init) => fetch(input, init))
}
