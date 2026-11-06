import { MIN_AMOUNT } from '../api/validation'

/** Suggested amounts in MXN (RF-D1a). The donor can also type any other amount (RF-D1b). */
export const SUGGESTED_AMOUNTS = [100, 250, 500, 1000, 2000, 5000, 10000, 20000] as const

export type CustomAmount = { amount: number; error?: undefined } | { amount?: undefined; error: string }

/**
 * Reads the "Otro monto" field. Accepts "1500", "1,500", "$1,500.50" and
 * "1500.5"; the comma is a thousands separator, as in Mexico. At least
 * $50, at most 2 decimals, no maximum (RF-D1b). Messages are for donors.
 */
export function parseCustomAmount(text: string): CustomAmount {
  const plain = text.replace(/[\s$,]/g, '')
  if (plain === '') return { error: 'Escribe un monto.' }
  if (!/^\d+(\.\d*)?$/.test(plain)) return { error: 'Escribe el monto solo con números, por ejemplo 750.' }
  if (!/^\d+(\.\d{0,2})?$/.test(plain)) return { error: 'El monto puede tener hasta 2 decimales.' }
  const amount = Number(plain)
  if (amount < MIN_AMOUNT) return { error: `El donativo mínimo es de $${MIN_AMOUNT}.` }
  return { amount }
}
