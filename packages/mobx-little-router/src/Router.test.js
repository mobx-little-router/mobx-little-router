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
      router._scheduler.dispatch(
        abortNavigation('PUSH', { pathname: '/' }, { pathname: '/a' })
      )
      await delay(0)
      await delay(0)

      expect(router.location.pathname).toEqual('/a/')

      router._scheduler.dispatch(abortNavigation('GO_BACK', { pathname: '/' }, null))
      await delay(0)
      await delay(0)

      expect(router.location.pathname).toEqual('/')

      router._scheduler.dispatch(
        abortNavigation('REPLACE', { pathname: '/' }, { pathname: '/b' })
      )
      await delay(0)
      await delay(0)

      expect(router.location.pathname).toEqual('/b/')
    })
  })

  test('stringify query into query', async () => {
    await router.push({ pathname: '/a', query: { b: '2', c: '3' } })
    expect(router.location.search).toEqual('?b=2&c=3')

    await router.push({ pathname: '/a', query: {} })
    expect(router.location.search).toEqual('')

    await router.push(({ pathname: '/a', query: null }: any)) // In case of dynamic `any` being pushed.
    expect(router.location.search).toEqual('')
  })

  test('pushQuery', async () => {
    await router.pushQuery({ b: '555' })
    expect(router.location.search).toEqual('?b=555')

    await router.pushQuery({})
    expect(router.location.search).toEqual('')

    await router.pushQuery(null)
    expect(router.location.search).toEqual('')
  })

  test('replaceQuery', async () => {
    await router.replaceQuery({ b: '111', c: 222 })
    expect(router.location.search).toEqual('?b=111&c=222')

    await router.replaceQuery({})
    expect(router.location.search).toEqual('')

    await router.replaceQuery(null)
    expect(router.location.search).toEqual('')
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
