import { describe, expect, it } from 'vitest'
import { formatDay, formatMoney, formatPlain, progressOf } from './format'

describe('format', () => {
  it('formats MXN without trailing zeros', () => {
    expect(formatMoney(31250)).toBe('$31,250')
    expect(formatMoney(250.5)).toBe('$250.50')
  })
  it('formats tile amounts', () => {
    expect(formatPlain(20000)).toBe('20,000')
  })
  it('formats calendar dates in Spanish without shifting the day', () => {
    expect(formatDay('2026-11-15')).toBe('15 de noviembre')
  })
})

describe('progressOf', () => {
  it('reports the gap below the goal', () => {
    expect(progressOf(31250, 50000)).toEqual({ percent: 62.5, fill: 0.625, remaining: 18750, over: 0 })
  })
  it('keeps counting past 100%', () => {
    const p = progressOf(61250.5, 50000)
    expect(p.fill).toBe(1)
    expect(p.remaining).toBe(0)
    expect(p.over).toBeCloseTo(11250.5)
    expect(p.percent).toBeGreaterThan(100)
  })
  it('handles a zero goal', () => {
    expect(progressOf(10, 0).fill).toBe(0)
  })
})
