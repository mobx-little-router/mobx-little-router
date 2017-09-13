// @flow
import { EventTypes } from '../events'
import Navigation from '../model/Navigation'
import type { NavigationStart } from '../events'
import withQuery from './withQuery'

describe('withQuery middleware', () => {
  test('transforms config load event', () => {
    const c: NavigationStart = {
      type: EventTypes.NAVIGATION_START,
      navigation: new Navigation({
        type: 'PUSH',
        to: {
          pathname: '/a',
          search: '?a=1&b=2&c=3'
        }
      })
    }

    expect(withQuery.fold(c)).toEqual(expect.objectContaining({
      navigation: expect.objectContaining({
        to: {
          pathname: '/a',
          search: '?a=1&b=2&c=3',
          query: {
            a: '1',
            b: '2',
            c: '3'
          }
        }
      })
    }))
  })
})
