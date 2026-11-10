import { useCallback, useEffect, useState } from 'react'

export type Loaded<T> = { state: 'loading' } | { state: 'ready'; value: T } | { state: 'failed'; error: unknown }

/**
 * Runs `load` when `key` changes and on retry. Answers that arrive after the
 * page moved on are dropped.
 */
export function useLoad<T>(load: () => Promise<T>, key: string): [Loaded<T>, () => void] {
  const [result, setResult] = useState<Loaded<T>>({ state: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    let active = true
    setResult({ state: 'loading' })
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
    }
    // `load` is rebuilt every render; `key` says when it asks for something new.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt])

  return [result, retry]
}
