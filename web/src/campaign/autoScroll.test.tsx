import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CampaignPage from './CampaignPage'
import { FADE_PX, HOLD_START_MS, SPEED, advance, fades } from './autoScroll'
import { openCampaign } from '../api/mock/fixtures'

describe('advance', () => {
  it('rises at the reading speed, without rounding away slow frames', () => {
    expect(advance(10, 1000 / 60, 900)).toBeCloseTo(10 + SPEED / 60)
  })

  it('treats a long frame gap as a short one, so the list never jumps', () => {
    expect(advance(0, 5000, 900)).toBeCloseTo(SPEED / 10)
  })

  it('wraps one copy back past the end, staying under the top fade', () => {
    const next = advance(900 + FADE_PX - 0.1, 100, 900)
    expect(next).toBeGreaterThanOrEqual(FADE_PX)
    expect(next).toBeLessThan(FADE_PX + 3)
  })
})

describe('fades', () => {
  it('fades nothing at the top, so the newest name is whole at rest', () => {
    expect(fades(0, 1800, 400)).toEqual({ top: 0, bottom: FADE_PX })
  })

  it('grows the top fade as the list rises, up to its full height', () => {
    expect(fades(10, 1800, 400).top).toBe(10)
    expect(fades(300, 1800, 400)).toEqual({ top: FADE_PX, bottom: FADE_PX })
  })

  it('fades nothing at the very bottom, so the last name is whole', () => {
    expect(fades(1400, 1800, 400)).toEqual({ top: FADE_PX, bottom: 0 })
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
    // jsdom has no layout: the box is 400px tall, one copy of the list 900px when `tall`.
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 400)
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => (tall ? 900 : 400))
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => (tall ? 1800 : 400))
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

  const box = () => document.querySelector<HTMLElement>('.thanks__box')!
  const advanceTime = (ms: number) => act(() => vi.advanceTimersByTime(ms))

  it('rises on its own after a wait, with a hidden second copy for the loop', () => {
    render(<CampaignPage campaign={many} renderPayment={payment} />)
    // Screen readers get each name once; the copy is hidden from them.
    expect(screen.getAllByRole('listitem')).toHaveLength(15)
    expect(box().querySelectorAll('li')).toHaveLength(30)
    advanceTime(HOLD_START_MS - 100)
    expect(box().scrollTop).toBe(0)
    advanceTime(1100)
    expect(box().scrollTop).toBeGreaterThan(0)
  })

  it('cannot be scrolled or stopped by the donor: no focus stop, no pause button', () => {
    render(<CampaignPage campaign={many} renderPayment={payment} />)
    expect(box()).not.toHaveAttribute('tabindex')
    expect(screen.queryByRole('button', { name: /lista/i })).not.toBeInTheDocument()
    expect(box()).toHaveClass('thanks__box--loops')
  })

  it('starts with no top fade and a bottom fade, and grows the top fade as it rises', () => {
    render(<CampaignPage campaign={many} renderPayment={payment} />)
    expect(box().style.getPropertyValue('--fade-top')).toBe('0px')
    expect(box().style.getPropertyValue('--fade-bottom')).toBe(`${FADE_PX}px`)
    advanceTime(HOLD_START_MS + 3000)
    expect(box().style.getPropertyValue('--fade-top')).toBe(`${FADE_PX}px`)
  })

  it('holds still while the pointer is over it, then moves on', () => {
    render(<CampaignPage campaign={many} renderPayment={payment} />)
    fireEvent.pointerEnter(box())
    advanceTime(HOLD_START_MS + 1000)
    expect(box().scrollTop).toBe(0)
    fireEvent.pointerLeave(box())
    advanceTime(HOLD_START_MS + 1000)
    expect(box().scrollTop).toBeGreaterThan(0)
  })

  it('never moves with reduced motion, and has no copy', () => {
    reduced = true
    render(<CampaignPage campaign={many} renderPayment={payment} />)
    expect(box().querySelectorAll('li')).toHaveLength(15)
    expect(box()).not.toHaveClass('thanks__box--loops')
    advanceTime(HOLD_START_MS + 1000)
    expect(box().scrollTop).toBe(0)
  })

  it('stays a plain list when every name fits', () => {
    tall = false
    render(<CampaignPage campaign={many} renderPayment={payment} />)
    expect(box()).not.toHaveClass('thanks__box--loops')
    expect(box().querySelectorAll('li')).toHaveLength(15)
  })
})
