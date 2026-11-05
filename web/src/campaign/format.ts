/** "$31,250", or "$250.50" when there are centavos. */
export function formatMoney(amount: number): string {
  const digits = Number.isInteger(amount) ? 0 : 2
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)
}

/** Plain thousands, for amount tiles: "1,000". */
export function formatPlain(amount: number): string {
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(amount)
}

/** "15 de noviembre". Contract dates are calendar dates, so no time zone shift. */
export function formatDay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  )
}

export interface Progress {
  percent: number // can pass 100
  fill: number // 0..1 for the bar
  remaining: number // 0 once the goal is reached
  over: number // amount above the goal
}

export function progressOf(raised: number, goal: number): Progress {
  const percent = goal > 0 ? (raised / goal) * 100 : 0
  return {
    percent,
    fill: Math.min(1, goal > 0 ? raised / goal : 0),
    remaining: Math.max(0, goal - raised),
    over: Math.max(0, raised - goal),
  }
}
