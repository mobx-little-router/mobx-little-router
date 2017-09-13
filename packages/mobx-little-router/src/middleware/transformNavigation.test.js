// @flow
import { EventTypes } from '../events'
import Navigation from '../model/Navigation'
import type { NavigationStart } from '../events'
import transformNavigation from './transformNavigation'

describe('transformNavigation middleware', () => {
  test('transforms config load event', () => {
    const g = transformNavigation(nav => {
      return {
        ...nav,
        to: {
          ...nav.to,
          search: '?hello'
        }
      }
    })

    const c: NavigationStart = {
      type: EventTypes.NAVIGATION_START,
      navigation: new Navigation({
        type: 'PUSH',
        to: {
          pathname: '/a'
        }
      })
    }

    expect(g.fold(c)).toEqual(expect.objectContaining({
      navigation: expect.objectContaining({
        to: {
          pathname: '/a',
          search: '?hello'
        }
      })
    }))
  })
})
