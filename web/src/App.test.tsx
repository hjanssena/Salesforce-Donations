import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => {
  delete window.__APP_CONFIG__
  vi.restoreAllMocks()
})

describe('App', () => {
  it('shows the Spanish heading when configured', () => {
    window.__APP_CONFIG__ = { sfSiteUrl: 'https://example.test', stripePublishableKey: 'pk_test_1' }
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Donativos Mexico Dreamin' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an unavailable notice when the configuration is invalid', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    window.__APP_CONFIG__ = { sfSiteUrl: 'https://example.test', stripePublishableKey: 'pk_live_1' }
    render(<App />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
