import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CampaignPage from './CampaignPage'
import { completedCampaign, openCampaign, shortCompletedCampaign } from '../api/mock/fixtures'

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

  it('opens the payment step in a modal for the chosen amount and comes back', () => {
    render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    fireEvent.click(screen.getByRole('radio', { name: '$500' }))
    const donate = screen.getByRole('button', { name: 'Donar $500' })
    fireEvent.click(donate)
    const dialog = screen.getByRole('dialog', { name: 'Tus datos' })
    expect(dialog).toHaveAttribute('open')
    expect(screen.getByText('Pago de 500')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tus datos' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar monto' }))
    expect(dialog).not.toHaveAttribute('open')
    expect(donate).toHaveFocus()
    expect(screen.getByRole('radio', { name: '$500' })).toHaveAttribute('aria-checked', 'true')
  })

  it('keeps the modal open while a payment is in flight', () => {
    const busyPayment = () => <form aria-busy="true">Pagando</form>
    render(<CampaignPage campaign={sampleCampaign} renderPayment={busyPayment} />)
    fireEvent.click(screen.getByRole('button', { name: 'Donar $250' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(screen.getByRole('dialog', { name: 'Tus datos' })).toHaveAttribute('open')
  })

  it('takes a custom amount typed by the donor', () => {
    render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    fireEvent.change(screen.getByLabelText('Otro monto'), { target: { value: '1,234.50' } })
    expect(screen.getAllByRole('radio').every((tile) => tile.getAttribute('aria-checked') === 'false')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Donar $1,234.50' }))
    expect(screen.getByText('Pago de 1234.5')).toBeInTheDocument()
  })

  it('has no maximum for a custom amount', () => {
    render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    fireEvent.change(screen.getByLabelText('Otro monto'), { target: { value: '50000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Donar $50,000' }))
    expect(screen.getByText('Pago de 50000')).toBeInTheDocument()
  })

  it('blocks a custom amount below the minimum and explains why', () => {
    render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    const other = screen.getByLabelText('Otro monto')
    fireEvent.change(other, { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Donar' }))
    expect(screen.getByText('El donativo mínimo es de $50.')).toBeInTheDocument()
    expect(other).toHaveFocus()
    expect(other).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText(/Pago de/)).not.toBeInTheDocument()
    fireEvent.change(other, { target: { value: '80' } })
    expect(screen.queryByText('El donativo mínimo es de $50.')).not.toBeInTheDocument()
  })

  it('blocks a custom amount that is not a number', () => {
    render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    fireEvent.change(screen.getByLabelText('Otro monto'), { target: { value: 'mil' } })
    fireEvent.click(screen.getByRole('button', { name: 'Donar' }))
    expect(screen.getByText(/solo con números/)).toBeInTheDocument()
  })

  it('clears the custom amount when a tile is picked', () => {
    render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    const other = screen.getByLabelText('Otro monto')
    fireEvent.change(other, { target: { value: '777' } })
    fireEvent.click(screen.getByRole('radio', { name: '$500' }))
    expect(other).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Donar $500' })).toBeInTheDocument()
  })

  it('shows an empty thanks wall', () => {
    render(<CampaignPage campaign={{ ...sampleCampaign, supporters: [] }} renderPayment={payment} />)
    expect(screen.getByText(/El tuyo puede ser el primero/)).toBeInTheDocument()
  })

  it('never renders the sample strip for real data', () => {
    render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    expect(screen.queryByText(/Vista previa/)).not.toBeInTheDocument()
  })

  it('shows a completed campaign read only, with what it raised and no way to donate (RF-D1c CA3)', () => {
    render(<CampaignPage campaign={completedCampaign} showBack renderPayment={payment} />)
    expect(screen.getByText('$22,400')).toBeInTheDocument()
    expect(screen.getByText(/cerró el 20 de noviembre de 2025/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Campaña cerrada' })).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Donar/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Donar' })).not.toBeInTheDocument()
    // Back to the list it came from: in the wall, and again in the footer.
    expect(screen.getAllByRole('link', { name: 'Campañas terminadas' })[0]).toHaveAttribute('href', '/campanas/finalizadas')
  })

  it('says how much a completed campaign fell short', () => {
    render(<CampaignPage campaign={shortCompletedCampaign} renderPayment={payment} />)
    expect(screen.getByText('Faltaron $5,200')).toBeInTheDocument()
  })

  it('links back to the open campaigns only when asked', () => {
    const { unmount } = render(<CampaignPage campaign={sampleCampaign} renderPayment={payment} />)
    expect(screen.queryByRole('link', { name: 'Todas las campañas' })).not.toBeInTheDocument()
    unmount()
    render(<CampaignPage campaign={sampleCampaign} showBack renderPayment={payment} />)
    expect(screen.getByRole('link', { name: 'Todas las campañas' })).toHaveAttribute('href', '/campanas')
    expect(screen.queryByRole('link', { name: 'Donar' })).not.toBeInTheDocument()
  })
})
