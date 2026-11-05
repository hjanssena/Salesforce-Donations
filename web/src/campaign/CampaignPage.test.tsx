import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CampaignPage from './CampaignPage'
import { sampleCampaign } from './sample'

describe('CampaignPage', () => {
  it('letters the missing amount', () => {
    render(<CampaignPage campaign={sampleCampaign} />)
    expect(screen.getByText('Faltan $18,750')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '63')
  })

  it('keeps counting past the goal', () => {
    render(<CampaignPage campaign={{ ...sampleCampaign, raisedAmount: 61250.5 }} />)
    expect(screen.getByText('Meta superada por $11,250.50')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '123% de la meta')
  })

  it('offers the eight suggested amounts and updates the donate sign', () => {
    render(<CampaignPage campaign={sampleCampaign} />)
    const tiles = screen.getAllByRole('radio')
    expect(tiles).toHaveLength(8)
    expect(screen.getByRole('radio', { name: '$250' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('radio', { name: '$1,000' }))
    expect(screen.getByRole('radio', { name: '$1,000' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('button', { name: 'Donar $1,000' })).toBeInTheDocument()
  })

  it('shows an empty thanks wall', () => {
    render(<CampaignPage campaign={{ ...sampleCampaign, supporters: [] }} />)
    expect(screen.getByText(/El tuyo puede ser el primero/)).toBeInTheDocument()
  })

  it('never renders the sample strip for real data', () => {
    render(<CampaignPage campaign={sampleCampaign} />)
    expect(screen.queryByText(/Vista previa/)).not.toBeInTheDocument()
  })
})
