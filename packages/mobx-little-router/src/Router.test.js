// @flow
import { createMemoryHistory } from 'history'
import Middleware from './middleware/Middleware'
import { EventTypes } from './events'
import Navigation from './model/Navigation'
import Router from './Router'
import delay from './util/delay'

describe('Router', () => {
  let router: any

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

  test('updateQuery', async () => {
    await router.updateQuery({ x: '1' })
    expect(router.location.search).toEqual('?x=1')

    await router.updateQuery({ y: '2' }, { merge: true })
    expect(router.location.search).toEqual('?x=1&y=2')

    await router.updateQuery({ y: '3' }, { merge: true })
    expect(router.location.search).toEqual('?x=1&y=3')

    await router.updateQuery({ y: '4', z: '5' })
    expect(router.location.search).toEqual('?y=4&z=5')

    await router.updateQuery({})
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
