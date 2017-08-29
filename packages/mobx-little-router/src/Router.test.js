// @flow
import { createMemoryHistory } from 'history'
import Route from './model/Route'
import { EventTypes } from './scheduling/events'
import Navigation from './model/Navigation'
import Router from './Router'
import delay from './util/delay'

describe('Router', () => {
  let router

  beforeEach(() => {
    router = new Router(createMemoryHistory, [
      Route({ path: '', match: 'full' }),
      Route({ path: 'a' }),
      Route({ path: 'b' }),
      Route({ path: 'c' })
    ])

    return router.start()
  })

  afterEach(() => {
    router.stop()
  })

  describe('events', () => {
    test('handling transition events', async () => {
      router.scheduler.emit(
        abortNavigation('PUSH', { pathname: '/' }, { pathname: '/a' })
      )
      await delay(0)

      expect(router.store.location.pathname).toEqual('/a/')

      router.scheduler.emit(abortNavigation('GO_BACK', { pathname: '/' }, null))
      await delay(0)

      expect(router.store.location.pathname).toEqual('/')

      router.scheduler.emit(
        abortNavigation('REPLACE', { pathname: '/' }, { pathname: '/b' })
      )
      await delay(0)

      expect(router.store.location.pathname).toEqual('/b/')
    })
  })
})

function abortNavigation(navigationType: *, from: *, to: *) {
  return {
    type: EventTypes.NAVIGATION_ABORTED,
    location: from,
    nextNavigation: new Navigation({
      type: navigationType,
      from,
      to
    })
  }
}
