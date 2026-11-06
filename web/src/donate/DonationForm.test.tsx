import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createApiClient } from '../api/client'
import { openCampaign } from '../api/mock/fixtures'
import { createMockFetch } from '../api/mock/mockFetch'
import type { PaymentSessionRequest } from '../api/types'
import DonationForm from './DonationForm'
import { submitDonation } from './submit'

const api = createApiClient('/services/apexrest/donations/v1', createMockFetch({ today: '2026-11-05' }))

/** The real submit path, with the card always valid and the confirm captured. */
function setup() {
  const sent: PaymentSessionRequest[] = []
  const confirm = vi.fn(async () => null)
  render(
    <DonationForm
      campaignId={openCampaign.id}
      amount={250}
      onChangeAmount={() => {}}
      cardField={<div>card</div>}
      onPay={(request) => {
        sent.push(request)
        return submitDonation(request, { api, checkCard: async () => null, confirm })
      }}
    />,
  )
  return { sent, confirm }
}

const type = (label: RegExp | string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const pay = () => fireEvent.click(screen.getByRole('button', { name: 'Pagar $250' }))

describe('DonationForm: recognition (RF-C1, RF-D2)', () => {
  it('asks a credited donor for a display name and email', () => {
    setup()
    expect(screen.getByLabelText('Nombre para la lista')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
  })

  it('blocks a credited donation without a display name', async () => {
    const { confirm } = setup()
    type('Correo electrónico', 'ana@example.com')
    pay()
    expect(await screen.findByText('Escribe el nombre que quieres mostrar.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre para la lista')).toHaveFocus()
    expect(screen.getByLabelText('Nombre para la lista')).toHaveAttribute('aria-invalid', 'true')
    expect(confirm).not.toHaveBeenCalled()
  })

  it('asks an anonymous donor only for an email, and never sends a name', async () => {
    const { sent, confirm } = setup()
    type('Nombre para la lista', 'Ana López')
    fireEvent.click(screen.getByRole('radio', { name: /Anónimo/ }))
    expect(screen.queryByLabelText('Nombre para la lista')).not.toBeInTheDocument()
    type('Correo electrónico', 'ana@example.com')
    pay()
    await waitFor(() => expect(confirm).toHaveBeenCalled())
    expect(sent[0]).toEqual({ campaignId: openCampaign.id, amount: 250, donorEmail: 'ana@example.com', isAnonymous: true })
  })

  it('blocks an anonymous donation without an email', async () => {
    setup()
    fireEvent.click(screen.getByRole('radio', { name: /Anónimo/ }))
    pay()
    expect(await screen.findByText('Escribe tu correo electrónico.')).toBeInTheDocument()
  })

  it('shows the API answer for a banned name', async () => {
    const { confirm } = setup()
    type('Nombre para la lista', 'spam')
    type('Correo electrónico', 'ana@example.com')
    pay()
    expect(await screen.findByText(/Ese nombre no se puede mostrar/)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Revisa los datos marcados.')
    expect(confirm).not.toHaveBeenCalled()
  })

  it('clears an error once it is fixed', async () => {
    setup()
    type('Correo electrónico', 'ana@example.com')
    pay()
    await screen.findByText('Escribe el nombre que quieres mostrar.')
    type('Nombre para la lista', 'Ana')
    expect(screen.queryByText('Escribe el nombre que quieres mostrar.')).not.toBeInTheDocument()
  })
})

describe('DonationForm: invoice (RF-F1)', () => {
  function openInvoice() {
    const result = setup()
    fireEvent.click(screen.getByRole('radio', { name: /Anónimo/ }))
    type('Correo electrónico', 'ana@example.com')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Necesito factura' }))
    return result
  }

  it('asks whether the donor is an individual or a company, and no display name when anonymous', () => {
    openInvoice()
    expect(screen.getByRole('radio', { name: 'Persona física' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Empresa' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Nombre para la lista')).not.toBeInTheDocument()
  })

  it('shows which invoice field is missing', async () => {
    openInvoice()
    pay()
    for (const text of [
      'Elige si donas como persona física o como empresa.',
      /Escribe tu nombre completo o razón social/,
      'Escribe tu RFC.',
      'Escribe el código postal de tu domicilio fiscal.',
      'Elige tu régimen fiscal.',
    ]) {
      expect(await screen.findByText(text)).toBeInTheDocument()
    }
  })

  it('rejects an RFC that does not fit the taxpayer type, and a short postal code', async () => {
    openInvoice()
    fireEvent.click(screen.getByRole('radio', { name: 'Empresa' }))
    type('Razón social', 'Empresa Ejemplo SA de CV')
    type('RFC', 'lopa800101abc')
    type('Código postal fiscal', '970')
    pay()
    expect(await screen.findByText(/El RFC no tiene el formato del SAT/)).toBeInTheDocument()
    expect(screen.getByText('El código postal debe tener 5 números.')).toBeInTheDocument()
    expect(screen.getByLabelText('RFC')).toHaveValue('LOPA800101ABC')
  })

  it('shows a bad donor email once, not again on the empty invoice email', async () => {
    setup()
    fireEvent.click(screen.getByRole('radio', { name: /Anónimo/ }))
    type('Correo electrónico', 'ana@example')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Necesito factura' }))
    pay()
    expect(await screen.findAllByText(/Debe verse como nombre@ejemplo.com/)).toHaveLength(1)
  })

  it('sends the five SAT items, with the donor email when no invoice email is given', async () => {
    const { sent, confirm } = openInvoice()
    fireEvent.click(screen.getByRole('radio', { name: 'Persona física' }))
    type('Nombre completo', 'Ana María López Pérez')
    type('RFC', 'LOPA800101ABC')
    type('Código postal fiscal', '97000')
    fireEvent.change(screen.getByLabelText('Régimen fiscal'), { target: { value: '612' } })
    pay()
    await waitFor(() => expect(confirm).toHaveBeenCalled())
    expect(sent.at(-1)?.invoice).toEqual({
      fullName: 'Ana María López Pérez',
      rfc: 'LOPA800101ABC',
      taxpayerType: 'individual',
      postalCode: '97000',
      taxRegime: '612',
      cfdiUse: 'D04',
      email: 'ana@example.com',
    })
    expect(sent.at(-1)).not.toHaveProperty('publicName')
  })
})
