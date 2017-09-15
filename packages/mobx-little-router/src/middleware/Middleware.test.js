// @flow
import { EventTypes } from '../events'
import Navigation from '../model/Navigation'
import type { Computation } from './Middleware'
import Middleware from './Middleware'
import transformEventType from './transformEventType'

describe('Middleware', () => {
  test('folding over computation', () => {
    const m = createNavigationStartMiddleware(evt => ({
      type: EventTypes.NAVIGATION_START,
      navigation: new Navigation({
        ...evt.navigation,
        to: { ...evt.navigation.to, search: '?hello' }
      })
    }))

    expect(
      m.fold({
        type: EventTypes.NAVIGATION_START,
        navigation: new Navigation({
          type: 'PUSH',
          to: {
            pathname: '/abc'
          }
        })
      })
    ).toEqual(
      expect.objectContaining({
        navigation: expect.objectContaining({
          to: {
            pathname: '/abc',
            search: '?hello'
          }
        })
      })
    )
  })

  test('captures errors from middleware', () => {
    class CustomError {}
    const m = Middleware(() => {
      throw new CustomError()
    })
    expect(m.fold({ type: EventTypes.EMPTY })).toEqual(
      expect.objectContaining({
        type: EventTypes.NAVIGATION_ERROR,
        error: expect.any(CustomError)
      })
    )
  })

  test('forms a semigroup under navigation manipulation', () => {
    const a = createNavigationStartMiddleware(evt => ({
      type: EventTypes.NAVIGATION_START,
      navigation: new Navigation({
        ...evt.navigation,
        to: { ...evt.navigation.to, search: '?hello' }
      })
    }))
    const b = createNavigationStartMiddleware(evt => ({
      type: EventTypes.NAVIGATION_START,
      navigation: new Navigation({
        ...evt.navigation,
        to: { ...evt.navigation.to, search: '?bye' }
      })
    }))
    const c = createNavigationStartMiddleware(evt => ({
      type: EventTypes.NAVIGATION_START,
      navigation: new Navigation({
        ...evt.navigation,
        to: { ...evt.navigation.to, search: '?hey' }
      })
    }))

    const associativeLaw1 = a.concat(b).concat(c)
    const associativeLaw2 = a.concat(b.concat(c))
    const evt = {
      type: EventTypes.NAVIGATION_START,
      navigation: new Navigation({
        type: 'PUSH',
        to: { pathname: '/abc' }
      })
    }

    expect(associativeLaw1.fold(evt)).toEqual(associativeLaw2.fold(evt))
    // Middleware is applied from left to right.
    expect(associativeLaw1.fold(evt)).toEqual(
      expect.objectContaining({
        navigation: expect.objectContaining({
          to: {
            pathname: '/abc',
            search: '?hey'
          }
        })
      })
    )
  })
})

function createNavigationStartMiddleware(f: Computation) {
  return transformEventType(EventTypes.NAVIGATION_START)(f)
}
