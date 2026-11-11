import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CampaignList from './CampaignList'
import { completedCampaign, openCampaign, secondOpenCampaign, shortCompletedCampaign } from '../api/mock/fixtures'

const item = ({ supporters: _supporters, ...campaign }: typeof openCampaign) => campaign

describe('CampaignList', () => {
  it('shows each open campaign with its details, progress and a way to donate (RF-D1a CA1)', () => {
    render(<CampaignList status="open" campaigns={[item(secondOpenCampaign), item(openCampaign)]} />)
    const boards = screen.getAllByRole('listitem')
    expect(boards).toHaveLength(2)

    const first = within(boards[0])
    expect(first.getByRole('heading', { name: secondOpenCampaign.name })).toBeInTheDocument()
    expect(first.getByText(secondOpenCampaign.purpose)).toBeInTheDocument()
    expect(first.getByText(secondOpenCampaign.description)).toBeInTheDocument()
    expect(first.getByText('$8,450')).toBeInTheDocument()
    expect(first.getByText(/de \$30,000 MXN · cierra el 28 de noviembre/)).toBeInTheDocument()
    expect(first.getByText('Faltan $21,550')).toBeInTheDocument()
    expect(first.getByRole('link', { name: `Ver y donar: ${secondOpenCampaign.name}` })).toHaveAttribute(
      'href',
      `/campanas/${secondOpenCampaign.id}`,
    )
  })

  it('shows completed campaigns with what they raised against the goal, and nothing to donate (RF-D1c CA1)', () => {
    render(<CampaignList status="completed" campaigns={[item(completedCampaign), item(shortCompletedCampaign)]} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Campañas terminadas' })).toBeInTheDocument()
    const [past, short] = screen.getAllByRole('listitem').map((board) => within(board))

    expect(past.getByText('$22,400')).toBeInTheDocument()
    expect(past.getByText('$20,000')).toBeInTheDocument()
    expect(past.getByText('112% de la meta')).toBeInTheDocument()
    expect(past.getByText('Cerró el 20 de noviembre de 2025')).toBeInTheDocument()
    expect(short.getByText('Llegó al 65%')).toBeInTheDocument()

    expect(screen.queryByRole('link', { name: /donar/i })).not.toBeInTheDocument()
    expect(past.getByRole('link', { name: completedCampaign.name })).toHaveAttribute('href', `/campanas/${completedCampaign.id}`)
  })

  it('says so when there are no completed campaigns yet', () => {
    render(<CampaignList status="completed" campaigns={[]} />)
    expect(screen.getByText('Todavía no hay campañas terminadas.')).toBeInTheDocument()
  })
})
