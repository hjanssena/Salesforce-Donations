import { apiBaseUrl, type AppConfig } from '../config/config'
import { createApiClient, type ApiClient } from './client'
import { MOCK_SCENARIOS, createMockFetch, type MockScenario } from './mock/mockFetch'

export { ApiError, type ApiClient } from './client'

/**
 * The API the app talks to. API_MODE picks the real Salesforce site or the
 * in-browser mock; nothing else in the app knows the difference.
 */
export function createApi(config: AppConfig, search = window.location.search): ApiClient {
  if (config.apiMode === 'mock') {
    const asked = new URLSearchParams(search).get('mock')
    const scenario = MOCK_SCENARIOS.find((s) => s === asked) ?? ('default' satisfies MockScenario)
    return createApiClient(apiBaseUrl(config), createMockFetch({ scenario, delayMs: 400 }))
  }
  return createApiClient(apiBaseUrl(config), (input, init) => fetch(input, init))
}
