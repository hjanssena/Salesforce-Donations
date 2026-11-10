import { useEffect, useState, type RefObject } from 'react'

/**
 * A small path router: the site has a handful of fixed routes, so a library
 * would add more than it saves. Links change the path with the History API;
 * Nginx serves index.html for every path, so reloads and shared links work.
 */

export const ROUTES = {
  home: '/',
  open: '/campanas',
  completed: '/campanas/finalizadas',
  campaign: (id: string) => `/campanas/${encodeURIComponent(id)}`,
} as const

export type Route =
  | { name: 'home' }
  | { name: 'open' }
  | { name: 'completed' }
  | { name: 'campaign'; id: string }
  | { name: 'thanks' }
  | { name: 'not-found' }

export function matchRoute(path: string, thanksPath: string): Route {
  const clean = path.length > 1 ? path.replace(/\/+$/, '') : path
  if (clean === '/' || clean === '') return { name: 'home' }
  if (clean === thanksPath) return { name: 'thanks' }
  if (clean === ROUTES.open) return { name: 'open' }
  if (clean === ROUTES.completed) return { name: 'completed' }
  const campaign = /^\/campanas\/([^/]+)$/.exec(clean)
  if (campaign) {
    try {
      return { name: 'campaign', id: decodeURIComponent(campaign[1]) }
    } catch {
      return { name: 'not-found' }
    }
  }
  return { name: 'not-found' }
}

const CHANGE = 'app:navigate'

/** Marks entries this app pushed, so the new page moves focus to its heading. */
interface NavState {
  nav: true
}

export function navigate(to: string) {
  const state: NavState = { nav: true }
  window.history.pushState(state, '', to)
  window.scrollTo?.(0, 0)
  window.dispatchEvent(new Event(CHANGE))
}

/** The current path. `initial` lets tests start anywhere. */
export function usePath(initial?: string): string {
  const [path, setPath] = useState(initial ?? window.location.pathname)
  useEffect(() => {
    const sync = () => setPath(window.location.pathname)
    window.addEventListener('popstate', sync)
    window.addEventListener(CHANGE, sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener(CHANGE, sync)
    }
  }, [])
  return path
}

/**
 * After an in-app move, focus lands on the new page's heading so screen
 * readers announce it. A first load keeps the browser's own focus.
 */
export function useFocusOnNavigate(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if ((window.history.state as NavState | null)?.nav) ref.current?.focus({ preventScroll: true })
  }, [ref])
}
