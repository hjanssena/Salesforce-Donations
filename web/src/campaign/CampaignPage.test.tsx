import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CampaignPage from './CampaignPage'
import { openCampaign } from '../api/mock/fixtures'

const sampleCampaign = { ...openCampaign, raisedAmount: 31250 }
const payment = (amount: number, back: () => void) => (
  <div>
    <p>Pago de {amount}</p>
    <button type="button" onClick={back}>
      Cambiar monto
    </button>
  </div>
)

describe('CampaignPage', () => {
  it('letters the missing amount', () => {
    render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    expect(screen.getByText('Faltan $18,750')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '63')
  })

  it('keeps counting past the goal', () => {
    render(<CampaignPage campaign={{ ...sampleCampaign, raisedAmount: 61250.5 }} renderPayment={payment} />)
    expect(screen.getByText('Meta superada por $11,250.50')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '123% de la meta')
  })

  it('offers the eight suggested amounts and updates the donate sign', () => {
    render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    const tiles = screen.getAllByRole('radio')
    expect(tiles).toHaveLength(8)
    expect(screen.getByRole('radio', { name: '$250' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('radio', { name: '$1,000' }))
    expect(screen.getByRole('radio', { name: '$1,000' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('button', { name: 'Donar $1,000' })).toBeInTheDocument()
  })

  it('opens the payment step for the chosen amount and comes back', () => {
    render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    fireEvent.click(screen.getByRole('radio', { name: '$500' }))
    fireEvent.click(screen.getByRole('button', { name: 'Donar $500' }))
    expect(screen.getByText('Pago de 500')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tus datos' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar monto' }))
    expect(screen.getByRole('radio', { name: '$500' })).toHaveAttribute('aria-checked', 'true')
  })

  it('shows an empty thanks wall', () => {
    render(<CampaignPage campaign={{ ...sampleCampaign, supporters: [] }} renderPayment={payment} />)
    expect(screen.getByText(/El tuyo puede ser el primero/)).toBeInTheDocument()
  })

  it('never renders the sample strip for real data', () => {
    render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    expect(screen.queryByText(/Vista previa/)).not.toBeInTheDocument()
  })
})
