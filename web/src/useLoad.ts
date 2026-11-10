import { useCallback, useEffect, useState } from 'react'

export type Loaded<T> = { state: 'loading' } | { state: 'ready'; value: T } | { state: 'failed'; error: unknown }

/** How long a load may take before the page gives up and offers to retry. */
export const LOAD_TIMEOUT_MS = 15000

/** The load took longer than the deadline; the page shows the retry notice. */
export class LoadTimeoutError extends Error {
  constructor(ms: number) {
    super(`The load took longer than ${ms} ms.`)
    this.name = 'LoadTimeoutError'
  }
}

/**
 * Runs `load` when `key` changes and on retry. Answers that arrive after the
 * page moved on, or after the deadline, are dropped. A load that hangs fails
 * after `timeoutMs`, so the visitor never waits on a blank wall forever.
 */
export function useLoad<T>(
  load: () => Promise<T>,
  key: string,
  { timeoutMs = LOAD_TIMEOUT_MS }: { timeoutMs?: number } = {},
): [Loaded<T>, () => void] {
  const [result, setResult] = useState<Loaded<T>>({ state: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    let active = true
    setResult({ state: 'loading' })
    const deadline = window.setTimeout(() => {
      if (!active) return
      active = false
      const error = new LoadTimeoutError(timeoutMs)
      console.error(error)
      setResult({ state: 'failed', error })
    }, timeoutMs)
    load().then(
      (value) => {
        if (active) setResult({ state: 'ready', value })
      },
      (error: unknown) => {
        console.error(error)
        if (active) setResult({ state: 'failed', error })
      },
    )
    return () => {
      active = false
      window.clearTimeout(deadline)
    }
    // `load` is rebuilt every render; `key` says when it asks for something new.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt, timeoutMs])

  return [result, retry]
}
