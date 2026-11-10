import { useEffect } from 'react'

type Listener = (message: string) => void

let listener: Listener | null = null

/** Registered by `<Announcer>`, which stays mounted while views come and go. */
export function setAnnouncer(next: Listener | null) {
  listener = next
}

/** Says something to screen readers through the page's one lasting status region. */
export function announce(message: string) {
  listener?.(message)
}

/**
 * Announces that a view is ready, on a first load only. After an in-app move the
 * view's heading takes focus and is read out, so announcing too would say it twice.
 */
export function useAnnounceReady(message: string | null) {
  useEffect(() => {
    if (message === null) return
    const state: unknown = window.history.state
    const inApp = typeof state === 'object' && state !== null && (state as { nav?: unknown }).nav === true
    if (!inApp) announce(message)
  }, [message])
}
