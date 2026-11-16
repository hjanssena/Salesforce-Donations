import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * The thanks wall moves on its own when it does not fit (RF-C1 CA6): it waits
 * at the top, glides slowly to the last name, waits, and goes back to the top.
 * It stays a normal scrollable box, so a donor can always read it by hand, and
 * it holds still while hovered, focused, just scrolled by hand, off screen, or
 * paused with its button. With reduced motion it never moves on its own.
 */

/** Pixels per second: slow enough to read each name as it passes. */
export const SPEED = 24
export const HOLD_START_MS = 2000
export const HOLD_END_MS = 3000
/** After the donor scrolls the list by hand, it waits this long before moving again. */
export const IDLE_AFTER_TOUCH_MS = 5000
/** A frame gap above this (a slow device, a background tab) counts as this. */
const MAX_FRAME_MS = 100

export type Phase = 'start' | 'run' | 'end'

export interface Motion {
  phase: Phase
  /** When the current phase began, in milliseconds. */
  since: number
  /** Scroll position in pixels, kept unrounded so slow speeds still advance. */
  pos: number
}

/** One frame of the loop. `max` is how far the box can scroll. */
export function step(motion: Motion, now: number, elapsedMs: number, max: number): Motion {
  switch (motion.phase) {
    case 'start':
      return now - motion.since >= HOLD_START_MS ? { phase: 'run', since: now, pos: motion.pos } : motion
    case 'run': {
      const pos = Math.min(max, motion.pos + (SPEED * Math.min(elapsedMs, MAX_FRAME_MS)) / 1000)
      return pos >= max ? { phase: 'end', since: now, pos: max } : { ...motion, pos }
    }
    case 'end':
      return now - motion.since >= HOLD_END_MS ? { phase: 'start', since: now, pos: 0 } : motion
  }
}

function reducedMotionQuery(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
}

export interface AutoScroll {
  /** The list is taller than its box. */
  overflows: boolean
  /** The donor asked for less motion; the list then only scrolls by hand. */
  reducedMotion: boolean
  paused: boolean
  setPaused: (paused: boolean) => void
}

/** `contentKey` changes when the rows change, so the box is measured again. */
export function useAutoScroll(ref: RefObject<HTMLElement | null>, contentKey: unknown): AutoScroll {
  const [overflows, setOverflows] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => reducedMotionQuery()?.matches ?? false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const box = ref.current
    if (!box) {
      setOverflows(false)
      return
    }
    const measure = () => setOverflows(box.scrollHeight - box.clientHeight > 1)
    measure()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    if (box.firstElementChild) observer.observe(box.firstElementChild)
    return () => observer.disconnect()
  }, [ref, contentKey])

  useEffect(() => {
    const query = reducedMotionQuery()
    if (!query) return
    const sync = () => setReducedMotion(query.matches)
    query.addEventListener?.('change', sync)
    return () => query.removeEventListener?.('change', sync)
  }, [])

  const moving = overflows && !reducedMotion && !paused

  // Why the list is holding still, kept in refs so the frame loop reads them without restarting.
  const hovered = useRef(false)
  const focused = useRef(false)
  const visible = useRef(true)
  const touchedAt = useRef(-Infinity)

  useEffect(() => {
    const box = ref.current
    if (!box || !moving) return

    const onEnter = () => (hovered.current = true)
    const onLeave = () => (hovered.current = false)
    const onFocusIn = () => (focused.current = true)
    const onFocusOut = (event: FocusEvent) => (focused.current = box.contains(event.relatedTarget as Node | null))
    const onTouch = () => (touchedAt.current = performance.now())
    const touchEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const
    box.addEventListener('pointerenter', onEnter)
    box.addEventListener('pointerleave', onLeave)
    box.addEventListener('focusin', onFocusIn)
    box.addEventListener('focusout', onFocusOut)
    touchEvents.forEach((name) => box.addEventListener(name, onTouch, { passive: true }))

    let observer: IntersectionObserver | undefined
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting))
      observer.observe(box)
    }

    // The loop's own clock and position, mutated frame by frame inside this effect.
    const started = performance.now()
    const loop = { last: started, frame: 0, motion: { phase: 'start', since: started, pos: box.scrollTop } as Motion }
    const tick = (now: number) => {
      const elapsed = now - loop.last
      loop.last = now
      const resting =
        hovered.current || focused.current || !visible.current || now - touchedAt.current < IDLE_AFTER_TOUCH_MS
      if (resting) {
        // Start again from wherever the donor left it, after the usual wait.
        loop.motion = { phase: 'start', since: now, pos: box.scrollTop }
      } else {
        const next = step(loop.motion, now, elapsed, box.scrollHeight - box.clientHeight)
        if (next.pos !== loop.motion.pos) {
          if (next.pos === 0 && typeof box.scrollTo === 'function') box.scrollTo({ top: 0, behavior: 'smooth' })
          else box.scrollTop = next.pos
        }
        loop.motion = next
      }
      loop.frame = requestAnimationFrame(tick)
    }
    loop.frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(loop.frame)
      observer?.disconnect()
      box.removeEventListener('pointerenter', onEnter)
      box.removeEventListener('pointerleave', onLeave)
      box.removeEventListener('focusin', onFocusIn)
      box.removeEventListener('focusout', onFocusOut)
      touchEvents.forEach((name) => box.removeEventListener(name, onTouch))
    }
  }, [ref, moving])

  return { overflows, reducedMotion, paused, setPaused }
}
