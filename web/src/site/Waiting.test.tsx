import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Waiting from './Waiting'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Waiting', () => {
  it('paints the wall at once and holds the words back, so a fast answer never flashes', () => {
    const { container } = render(<Waiting text="Preparando la campaña…" />)
    expect(container.querySelector('.wall.wall--yellow .signature')).toHaveTextContent('SF Vibe Lab · Mérida')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(container.querySelector('.waiting__brush')).toBeNull()
  })

  it('says what it prepares, then admits a slow connection', () => {
    const { container } = render(<Waiting text="Preparando la campaña…" />)
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(screen.getByRole('status')).toHaveTextContent('Preparando la campaña…')
    expect(container.querySelector('.waiting__brush')).toHaveAttribute('aria-hidden', 'true')
    act(() => {
      vi.advanceTimersByTime(4700)
    })
    expect(screen.getByRole('status')).toHaveTextContent('Sigue cargando… la conexión está lenta.')
  })

  it('paints the coat the page will have', () => {
    const anil = render(<Waiting text="x" tone="anil" isSample />)
    expect(anil.container.querySelector('.wall')).toHaveClass('wall--anil')
    expect(screen.getByText(/Vista previa/)).toBeInTheDocument()
    anil.unmount()
    const primer = render(<Waiting text="x" tone="primer" />)
    expect(primer.container.querySelector('.wall')).toHaveClass('wall--weathered')
  })
})
