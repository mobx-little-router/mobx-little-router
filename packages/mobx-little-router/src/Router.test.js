// @flow
import { createMemoryHistory } from 'history'
import Middleware from './middleware/Middleware'
import { EventTypes } from './events'
import Navigation from './model/Navigation'
import Router from './Router'
import delay from './util/delay'

describe('Router', () => {
  let router

  beforeEach(() => {
    router = new Router(
      createMemoryHistory(),
      [{ path: '', match: 'full' }, { path: 'a' }, { path: 'b' }, { path: 'c' }],
      () => ({ message: 'Hello' }),
      Middleware.EMPTY
    )

    return router.start()
  })

  afterEach(() => {
    router.stop()
  })

  describe('events', () => {
    test('handling transition events', async () => {
      router.scheduler.dispatch(
        abortNavigation('PUSH', { pathname: '/' }, { pathname: '/a' })
      )
      await delay(0)
      await delay(0)

      expect(router.store.location.pathname).toEqual('/a/')

      router.scheduler.dispatch(abortNavigation('GO_BACK', { pathname: '/' }, null))
      await delay(0)
      await delay(0)

      expect(router.store.location.pathname).toEqual('/')

      router.scheduler.dispatch(
        abortNavigation('REPLACE', { pathname: '/' }, { pathname: '/b' })
      )
      await delay(0)
      await delay(0)

      expect(router.store.location.pathname).toEqual('/b/')
    })
  })

  test('stringify query into query', async () => {
    await router.push({ pathname: '/a', query: { b: '2', c: '3' } })
    expect(router.store.location.search).toEqual('?b=2&c=3')

    await router.push({ pathname: '/a', query: {} })
    expect(router.store.location.search).toEqual('')

    await router.push(({ pathname: '/a', query: null }: any)) // In case of dynamic `any` being pushed.
    expect(router.store.location.search).toEqual('')
  })
})

function abortNavigation(navigationType: *, from: *, to: *) {
  return {
    type: EventTypes.NAVIGATION_CANCELLED,
    nextNavigation: new Navigation({
      type: navigationType,
      from,
      to
    })
  }
}
