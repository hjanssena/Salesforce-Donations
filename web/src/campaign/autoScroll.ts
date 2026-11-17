import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * The thanks wall moves on its own when it does not fit (RF-C1 CA6): after a
 * short wait the names rise without end, fading in at the bottom edge and out
 * at the top. A second, hidden copy of the list follows the first, so the loop
 * never jumps back. It stays a normal scrollable box, so a donor can always
 * read it by hand, and it holds still while hovered, focused, just scrolled by
 * hand, off screen, or paused with its button. With reduced motion it never
 * moves on its own and there is no copy.
 */

/** Pixels per second: slow enough to read each name as it passes. */
export const SPEED = 24
/** The wait before the first move, and after the donor lets go of the list. */
export const HOLD_START_MS = 2000
/** After the donor scrolls the list by hand, it waits this long before moving again. */
export const IDLE_AFTER_TOUCH_MS = 5000
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

/** Moves a hand scroll past the end of the first copy back by one copy, as `advance` does. */
function wrapScroll(el: HTMLElement, period: number) {
  if (period > 0 && el.scrollTop >= period + FADE_PX) el.scrollTop -= period
}

function reducedMotionQuery(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
}

export interface AutoScroll {
  /** One copy of the list is taller than its box. */
  overflows: boolean
  /** The list loops on its own: it overflows and the donor did not ask for less motion. */
  loops: boolean
  paused: boolean
  setPaused: (paused: boolean) => void
}

/**
 * `box` is the scrolling element, `list` the first copy of the rows inside it.
 * `contentKey` changes when the rows change, so the list is measured again.
 */
export function useAutoScroll(
  box: RefObject<HTMLElement | null>,
  list: RefObject<HTMLElement | null>,
  contentKey: unknown,
): AutoScroll {
  const [overflows, setOverflows] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => reducedMotionQuery()?.matches ?? false)
  const [paused, setPaused] = useState(false)
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

  // Paint the edge fades, and wrap a hand scroll the same way the loop wraps.
  useEffect(() => {
    const el = box.current
    const rows = list.current
    if (!el || !rows || !overflows) return
    const onScroll = () => {
      if (loops) wrapScroll(el, rows.offsetHeight)
      const fade = fades(el.scrollTop, el.scrollHeight, el.clientHeight)
      el.style.setProperty('--fade-top', `${fade.top}px`)
      el.style.setProperty('--fade-bottom', `${fade.bottom}px`)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [box, list, overflows, loops])

  // Why the list is holding still, kept in refs so the frame loop reads them without restarting.
  const hovered = useRef(false)
  const focused = useRef(false)
  const visible = useRef(true)
  const touchedAt = useRef(-Infinity)
  const moving = loops && !paused

  useEffect(() => {
    const el = box.current
    const rows = list.current
    if (!el || !rows || !moving) return

    const onEnter = () => (hovered.current = true)
    const onLeave = () => (hovered.current = false)
    const onFocusIn = () => (focused.current = true)
    const onFocusOut = (event: FocusEvent) => (focused.current = el.contains(event.relatedTarget as Node | null))
    const onTouch = () => (touchedAt.current = performance.now())
    const touchEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('focusin', onFocusIn)
    el.addEventListener('focusout', onFocusOut)
    touchEvents.forEach((name) => el.addEventListener(name, onTouch, { passive: true }))

    let observer: IntersectionObserver | undefined
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting))
      observer.observe(el)
    }

    // The loop's own clock and position, mutated frame by frame inside this effect.
    // The position is kept unrounded so slow speeds still advance.
    const started = performance.now()
    const loop = { last: started, since: started, pos: el.scrollTop, frame: 0 }
    const tick = (now: number) => {
      const elapsed = now - loop.last
      loop.last = now
      const resting =
        hovered.current || focused.current || !visible.current || now - touchedAt.current < IDLE_AFTER_TOUCH_MS
      if (resting) {
        // Start again from wherever the donor left it, after the usual wait.
        loop.since = now
        loop.pos = el.scrollTop
      } else if (now - loop.since >= HOLD_START_MS) {
        loop.pos = advance(loop.pos, elapsed, rows.offsetHeight)
        el.scrollTop = loop.pos
      }
      loop.frame = requestAnimationFrame(tick)
    }
    loop.frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(loop.frame)
      observer?.disconnect()
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('focusin', onFocusIn)
      el.removeEventListener('focusout', onFocusOut)
      touchEvents.forEach((name) => el.removeEventListener(name, onTouch))
    }
  }, [box, list, moving])

  return { overflows, loops, paused, setPaused }
}
