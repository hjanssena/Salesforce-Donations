import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * The thanks wall moves on its own when it does not fit (RF-C1 CA6): after a
 * short wait the names rise without end, fading in at the bottom edge and out
 * at the top. A second, hidden copy of the list follows the first, so the loop
 * never jumps back. Donors cannot scroll it; it only holds still while the
 * pointer is over it (to read a name) or while it is off screen. With reduced
 * motion it never moves, and the stylesheet shows the whole list instead, so
 * every name can still be read.
 */

/** Pixels per second: slow enough to read each name as it passes. */
export const SPEED = 24
/** The wait before the first move, and after the pointer leaves the list. */
export const HOLD_START_MS = 2000
/** How tall each edge fade is, in pixels. */
export const FADE_PX = 40
/** A frame gap above this (a slow device, a background tab) counts as this. */
const MAX_FRAME_MS = 100

/**
 * The next scroll position. `period` is the height of one copy of the list.
 * Wrapping one period back shows the same rows, and keeping the position at or
 * above the fade means the top fade never flickers off at the seam.
 */
export function advance(pos: number, elapsedMs: number, period: number): number {
  const next = pos + (SPEED * Math.min(elapsedMs, MAX_FRAME_MS)) / 1000
  return period > 0 && next >= period + FADE_PX ? next - period : next
}

/** Edge fades for a scroll position: none at the very top or bottom, so no row there is ever faded. */
export function fades(scrollTop: number, scrollHeight: number, clientHeight: number) {
  const clamp = (value: number) => Math.max(0, Math.min(FADE_PX, value))
  return { top: clamp(scrollTop), bottom: clamp(scrollHeight - clientHeight - scrollTop) }
}

function reducedMotionQuery(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
}

function paintFades(el: HTMLElement) {
  const fade = fades(el.scrollTop, el.scrollHeight, el.clientHeight)
  el.style.setProperty('--fade-top', `${fade.top}px`)
  el.style.setProperty('--fade-bottom', `${fade.bottom}px`)
}

/**
 * `box` is the clipping element, `list` the first copy of the rows inside it.
 * `contentKey` changes when the rows change, so the list is measured again.
 * Returns whether the list loops: one copy is taller than its box and the
 * donor did not ask for less motion.
 */
export function useAutoScroll(
  box: RefObject<HTMLElement | null>,
  list: RefObject<HTMLElement | null>,
  contentKey: unknown,
): boolean {
  const [overflows, setOverflows] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => reducedMotionQuery()?.matches ?? false)
  const loops = overflows && !reducedMotion

  useEffect(() => {
    const el = box.current
    const rows = list.current
    // No rows (an empty wall) means nothing to measure; the list starts as not overflowing.
    if (!el || !rows) return
    const measure = () => setOverflows(rows.offsetHeight - el.clientHeight > 1)
    measure()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    observer.observe(rows)
    return () => observer.disconnect()
  }, [box, list, contentKey])

  useEffect(() => {
    const query = reducedMotionQuery()
    if (!query) return
    const sync = () => setReducedMotion(query.matches)
    query.addEventListener?.('change', sync)
    return () => query.removeEventListener?.('change', sync)
  }, [])

  // Why the list is holding still, kept in refs so the frame loop reads them without restarting.
  const hovered = useRef(false)
  const visible = useRef(true)

  useEffect(() => {
    const el = box.current
    const rows = list.current
    if (!el || !rows || !loops) return

    const onEnter = () => (hovered.current = true)
    const onLeave = () => (hovered.current = false)
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)

    let observer: IntersectionObserver | undefined
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting))
      observer.observe(el)
    }

    paintFades(el)
    // The loop's own clock and position, mutated frame by frame inside this effect.
    // The position is kept unrounded so slow speeds still advance.
    const started = performance.now()
    const loop = { last: started, since: started, pos: el.scrollTop, frame: 0 }
    const tick = (now: number) => {
      const elapsed = now - loop.last
      loop.last = now
      if (hovered.current || !visible.current) {
        // Hold where it is, and wait again before moving on.
        loop.since = now
      } else if (now - loop.since >= HOLD_START_MS) {
        loop.pos = advance(loop.pos, elapsed, rows.offsetHeight)
        scrollTo(el, loop.pos)
      }
      loop.frame = requestAnimationFrame(tick)
    }
    loop.frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(loop.frame)
      observer?.disconnect()
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [box, list, loops])

  return loops
}

function scrollTo(el: HTMLElement, top: number) {
  el.scrollTop = top
  paintFades(el)
}
