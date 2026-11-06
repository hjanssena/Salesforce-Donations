import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { ApiError, createApiClient, type ApiClient } from './api/client'
import { createMockFetch } from './api/mock/mockFetch'

const mockConfig = { apiMode: 'mock' as const, stripePublishableKey: 'pk_test_1' }
const mockApi = (scenario: 'default' | 'no-open' = 'default') =>
  createApiClient('/services/apexrest/donations/v1', createMockFetch({ scenario, today: '2026-11-05' }))

afterEach(() => {
  delete window.__APP_CONFIG__
  vi.restoreAllMocks()
})

describe('App', () => {
  it('opens the open campaign from the mock API and marks it as sample data', async () => {
    window.__APP_CONFIG__ = mockConfig
    render(<App api={mockApi()} />)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando')
    expect(await screen.findByRole('heading', { level: 1, name: 'Becas Mexico Dreamin 2026' })).toBeInTheDocument()
    expect(screen.getByText(/Vista previa/)).toBeInTheDocument()
    expect(screen.getByText('Ana López')).toBeInTheDocument()
  })

  it('says so when no campaign is open', async () => {
    window.__APP_CONFIG__ = mockConfig
    render(<App api={mockApi('no-open')} />)
    expect(await screen.findByRole('heading', { name: 'Sin campañas abiertas' })).toBeInTheDocument()
  })

  it('offers a retry when the API fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    window.__APP_CONFIG__ = mockConfig
    const failing: ApiClient = {
      listCampaigns: () => Promise.reject(new ApiError(0, 'NETWORK_ERROR', 'offline')),
      getCampaign: () => Promise.reject(new Error('unused')),
      createPaymentSession: () => Promise.reject(new Error('unused')),
    }
    render(<App api={failing} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('No cargó la campaña')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('does not mark real data as a sample', async () => {
    window.__APP_CONFIG__ = { apiMode: 'salesforce', sfSiteUrl: 'https://example.test', stripePublishableKey: 'pk_test_1' }
    render(<App api={mockApi()} />)
    await screen.findByRole('heading', { level: 1 })
    expect(screen.queryByText(/Vista previa/)).not.toBeInTheDocument()
  })

  it('serves the thank-you page at /gracias', async () => {
    window.__APP_CONFIG__ = mockConfig
    const gateway = { confirm: async () => null, retrieve: async () => null }
    render(<App api={mockApi()} gateway={gateway} path="/gracias" />)
    expect(await screen.findByRole('heading', { name: 'Sin pago a la vista' })).toBeInTheDocument()
  })

  it('shows an unavailable notice when the configuration is invalid', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    window.__APP_CONFIG__ = { sfSiteUrl: 'https://example.test', stripePublishableKey: 'pk_live_1' }
    render(<App />)
    expect(screen.getByRole('alert')).toHaveTextContent('Volvemos pronto')
  })
})
