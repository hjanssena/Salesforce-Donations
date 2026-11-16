import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CampaignPage from './CampaignPage'
import { HOLD_END_MS, HOLD_START_MS, IDLE_AFTER_TOUCH_MS, SPEED, step, type Motion } from './autoScroll'
import { openCampaign } from '../api/mock/fixtures'

describe('step', () => {
  const max = 100

  it('waits at the top before moving', () => {
    const start: Motion = { phase: 'start', since: 0, pos: 0 }
    expect(step(start, HOLD_START_MS - 1, 16, max)).toBe(start)
    expect(step(start, HOLD_START_MS, 16, max)).toEqual({ phase: 'run', since: HOLD_START_MS, pos: 0 })
  })

  it('glides at the reading speed, without rounding away slow frames', () => {
    const run: Motion = { phase: 'run', since: 0, pos: 10 }
    expect(step(run, 1000, 1000 / 60, max).pos).toBeCloseTo(10 + SPEED / 60)
  })

  it('treats a long frame gap as a short one, so the list never jumps', () => {
    const run: Motion = { phase: 'run', since: 0, pos: 0 }
    expect(step(run, 5000, 5000, max).pos).toBeCloseTo(SPEED / 10)
  })

  it('stops at the last name, waits, and goes back to the top', () => {
    const near: Motion = { phase: 'run', since: 0, pos: 99.9 }
    const end = step(near, 4000, 100, max)
    expect(end).toEqual({ phase: 'end', since: 4000, pos: max })
    expect(step(end, 4000 + HOLD_END_MS - 1, 16, max)).toBe(end)
    expect(step(end, 4000 + HOLD_END_MS, 16, max)).toEqual({ phase: 'start', since: 4000 + HOLD_END_MS, pos: 0 })
  })
})

describe('thanks wall', () => {
  const payment = () => <p>Pago</p>
  const many = {
    ...openCampaign,
    supporters: Array.from({ length: 15 }, (_, i) => ({ displayName: `Donante ${i + 1}`, amount: 100 })),
  }
  let reduced = false
  let tall = true

  beforeEach(() => {
    reduced = false
    tall = true
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    // jsdom has no layout: the box is 400px tall, the list 900px when `tall`.
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 400)
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => (tall ? 900 : 400))
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: reduced && query.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const box = () => screen.getByRole('region', { name: 'Lista de 15 donantes' })
  const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))

  it('lists every supporter in a box that moves on its own after a wait', () => {
    render(<CampaignPage campaign={many} renderPayment={payment} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(15)
    expect(box()).toHaveAttribute('tabindex', '0')
    advance(HOLD_START_MS - 100)
    expect(box().scrollTop).toBe(0)
    advance(1100)
    expect(box().scrollTop).toBeGreaterThan(0)
  })

  it('holds still while the pointer is over it, and after a hand scroll', () => {
    render(<CampaignPage campaign={many} renderPayment={payment} />)
    fireEvent.pointerEnter(box())
    advance(HOLD_START_MS + 1000)
    expect(box().scrollTop).toBe(0)
    fireEvent.pointerLeave(box())
    fireEvent.wheel(box())
    advance(IDLE_AFTER_TOUCH_MS - 100)
    expect(box().scrollTop).toBe(0)
  })

  it('pauses and resumes with its button', () => {
    render(<CampaignPage campaign={many} renderPayment={payment} />)
    fireEvent.click(screen.getByRole('button', { name: 'Pausar lista' }))
    advance(HOLD_START_MS + 1000)
    expect(box().scrollTop).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Reanudar lista' }))
    advance(HOLD_START_MS + 1000)
    expect(box().scrollTop).toBeGreaterThan(0)
  })

  it('never moves on its own with reduced motion, but still scrolls by hand', () => {
    reduced = true
    render(<CampaignPage campaign={many} renderPayment={payment} />)
    expect(screen.queryByRole('button', { name: 'Pausar lista' })).not.toBeInTheDocument()
    expect(box()).toHaveAttribute('tabindex', '0')
    advance(HOLD_START_MS + 1000)
    expect(box().scrollTop).toBe(0)
  })

  it('stays a plain list when every name fits', () => {
    tall = false
    render(<CampaignPage campaign={many} renderPayment={payment} />)
    expect(screen.queryByRole('region', { name: /donantes/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pausar lista' })).not.toBeInTheDocument()
  })
})
