import { describe, expect, it } from 'vitest'
import { matchRoute, ROUTES } from './router'

describe('matchRoute', () => {
  it.each([
    ['/', { name: 'home' }],
    ['/campanas', { name: 'open' }],
    ['/campanas/', { name: 'open' }],
    ['/campanas/finalizadas', { name: 'completed' }],
    ['/campanas/701Hs00000AbCdEFGH', { name: 'campaign', id: '701Hs00000AbCdEFGH' }],
    ['/gracias', { name: 'thanks' }],
    ['/campanas/a/b', { name: 'not-found' }],
    ['/campanas/%E0%A4%A', { name: 'not-found' }],
    ['/admin', { name: 'not-found' }],
  ])('%s', (path, route) => {
    expect(matchRoute(path, '/gracias')).toEqual(route)
  })

  it('round-trips campaign IDs', () => {
    expect(matchRoute(ROUTES.campaign('a b/c'), '/gracias')).toEqual({ name: 'campaign', id: 'a b/c' })
  })
})
