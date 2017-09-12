// @flow
import { createMemoryHistory } from 'history'
import { EventTypes } from './scheduling/events'
import Navigation from './model/Navigation'
import Router from './Router'
import delay from './util/delay'

describe('Router', () => {
  let router

  beforeEach(() => {
    router = new Router(createMemoryHistory(), [
      { path: '', match: 'full' },
      { path: 'a' },
      { path: 'b' },
      { path: 'c' }
    ], () => ({ message: 'Hello' }))

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

      expect(router.store.location.pathname).toEqual('/a/')

      router.scheduler.dispatch(abortNavigation('GO_BACK', { pathname: '/' }, null))
      await delay(0)

      expect(router.store.location.pathname).toEqual('/')

      router.scheduler.dispatch(
        abortNavigation('REPLACE', { pathname: '/' }, { pathname: '/b' })
      )
      await delay(0)

      expect(router.store.location.pathname).toEqual('/b/')
    })
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
