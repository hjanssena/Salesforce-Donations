import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoadTimeoutError, useLoad } from './useLoad'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useLoad', () => {
  it('gives up on a load that hangs, so the page can offer to retry', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useLoad(() => new Promise<never>(() => {}), 'k', { timeoutMs: 1000 }))
    expect(result.current[0].state).toBe('loading')
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    const loaded = result.current[0]
    expect(loaded.state).toBe('failed')
    expect(loaded.state === 'failed' && loaded.error).toBeInstanceOf(LoadTimeoutError)
  })

  it('keeps an answer that arrives before the deadline', async () => {
    const { result } = renderHook(() => useLoad(async () => 7, 'k', { timeoutMs: 1000 }))
    await act(async () => {})
    expect(result.current[0]).toEqual({ state: 'ready', value: 7 })
  })
})
