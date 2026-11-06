import { describe, expect, it } from 'vitest'
import { parseCustomAmount } from './amounts'

describe('parseCustomAmount', () => {
  it('reads plain and formatted amounts', () => {
    expect(parseCustomAmount('750')).toEqual({ amount: 750 })
    expect(parseCustomAmount(' $1,500.50 ')).toEqual({ amount: 1500.5 })
    expect(parseCustomAmount('50')).toEqual({ amount: 50 })
  })

  it('has no maximum', () => {
    expect(parseCustomAmount('250000')).toEqual({ amount: 250000 })
  })

  it('asks for an amount when empty', () => {
    expect(parseCustomAmount('  ').error).toBe('Escribe un monto.')
  })

  it('rejects text, negatives and zero', () => {
    expect(parseCustomAmount('mil').error).toMatch(/solo con números/)
    expect(parseCustomAmount('-100').error).toMatch(/solo con números/)
    expect(parseCustomAmount('0').error).toMatch(/mínimo es de \$50/)
  })

  it('holds the $50 minimum', () => {
    expect(parseCustomAmount('49.99').error).toBe('El donativo mínimo es de $50.')
  })

  it('allows at most 2 decimals', () => {
    expect(parseCustomAmount('100.505').error).toBe('El monto puede tener hasta 2 decimales.')
  })
})
