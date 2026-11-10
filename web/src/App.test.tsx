import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { ApiError, createApiClient, type ApiClient } from './api/client'
import { completedCampaign, secondOpenCampaign } from './api/mock/fixtures'
import { createMockFetch, type MockScenario } from './api/mock/mockFetch'

const mockConfig = { apiMode: 'mock' as const, stripePublishableKey: 'pk_test_1' }
const mockApi = (scenario: MockScenario = 'default') =>
  createApiClient('/services/apexrest/donations/v1', createMockFetch({ scenario, today: '2026-11-05' }))

afterEach(() => {
  window.history.replaceState(null, '', '/')
  delete window.__APP_CONFIG__
  vi.restoreAllMocks()
})

describe('App', () => {
  it('opens the open campaign from the mock API and marks it as sample data', async () => {
    window.__APP_CONFIG__ = mockConfig
    render(<App api={mockApi()} />)
    // The page waits as its own bare wall, with the sample strip already in place.
    expect(document.querySelector('main[aria-busy="true"] .wall')).not.toBeNull()
    expect(screen.getByText(/Vista previa/)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1, name: 'Becas Mexico Dreamin 2026' })).toBeInTheDocument()
    expect(screen.getByText(/Vista previa/)).toBeInTheDocument()
    expect(screen.getByText('Ana López')).toBeInTheDocument()
    // A first load is announced; an in-app move is read out through the focused heading instead.
    expect(await screen.findByText('Campaña lista: Becas Mexico Dreamin 2026')).toHaveClass('visually-hidden')
  })

  it('says so when no campaign is open, and leads to the completed ones (RF-D1c CA2)', async () => {
    window.__APP_CONFIG__ = mockConfig
    render(<App api={mockApi('no-open')} />)
    expect(await screen.findByRole('heading', { name: 'Sin campañas abiertas' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Ver campañas terminadas' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Campañas terminadas' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/campanas/finalizadas')
  })

  it('lists the open campaigns when more than one is open (RF-D1a CA1)', async () => {
    window.__APP_CONFIG__ = mockConfig
    render(<App api={mockApi('many-open')} />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Elige una campaña' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('goes from the list to a campaign and back', async () => {
    window.__APP_CONFIG__ = mockConfig
    render(<App api={mockApi('many-open')} />)
    await screen.findByRole('heading', { level: 1, name: 'Elige una campaña' })

    fireEvent.click(screen.getByRole('link', { name: `Ver y donar: ${secondOpenCampaign.name}` }))
    const title = await screen.findByRole('heading', { level: 1, name: secondOpenCampaign.name })
    expect(window.location.pathname).toBe(`/campanas/${secondOpenCampaign.id}`)
    expect(title).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Donar $250' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Todas las campañas' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Elige una campaña' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/campanas')
  })

  it('opens a completed campaign from its list, read only, and comes back (RF-D1c CA3)', async () => {
    window.__APP_CONFIG__ = mockConfig
    render(<App api={mockApi()} path="/campanas/finalizadas" />)
    await screen.findByRole('heading', { level: 1, name: 'Campañas terminadas' })

    const board = screen.getAllByRole('listitem')[0]
    fireEvent.click(within(board).getByRole('link', { name: completedCampaign.name }))
    expect(await screen.findByRole('heading', { level: 1, name: completedCampaign.name })).toBeInTheDocument()
    expect(screen.getByText('Ana López')).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Donar/ })).not.toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('link', { name: 'Campañas terminadas' })[0])
    expect(await screen.findByRole('heading', { level: 1, name: 'Campañas terminadas' })).toBeInTheDocument()
  })

  it('follows the browser back button', async () => {
    window.__APP_CONFIG__ = mockConfig
    window.history.replaceState(null, '', '/campanas/finalizadas')
    render(<App api={mockApi()} />)
    await screen.findByRole('heading', { level: 1, name: 'Campañas terminadas' })
    fireEvent.click(within(screen.getAllByRole('listitem')[0]).getByRole('link', { name: completedCampaign.name }))
    await screen.findByRole('heading', { level: 1, name: completedCampaign.name })

    window.history.back()
    expect(await screen.findByRole('heading', { level: 1, name: 'Campañas terminadas' })).toBeInTheDocument()
  })

  it('says so for an unknown campaign', async () => {
    window.__APP_CONFIG__ = mockConfig
    render(<App api={mockApi()} path="/campanas/701Hs00000NoSuCHXX" />)
    expect(await screen.findByRole('heading', { name: 'No encontramos esa campaña' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver campañas abiertas' })).toHaveAttribute('href', '/campanas')
  })

  it('says so for an unknown address', () => {
    window.__APP_CONFIG__ = mockConfig
    render(<App api={mockApi()} path="/admin" />)
    expect(screen.getByRole('heading', { name: 'No encontramos esa campaña' })).toBeInTheDocument()
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
