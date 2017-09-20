// @flow
import timerMiddleware from './timerMiddleware'
import { EventTypes } from '../../events/index'
import Navigation from '../../model/Navigation'

describe('timerMiddleware', () => {
  test('Adds elapsed time for each sequence', () => {
    const m = timerMiddleware(inc10ms)
    const a = new Navigation({
      type: 'POP',
      sequence: 1
    })

    expect(
      m.fold({
        type: EventTypes.NAVIGATION_START,
        navigation: a
      })
    ).toEqual(
      expect.objectContaining({
        elapsed: 0
      })
    )

    expect(
      m.fold({
        type: EventTypes.NAVIGATION_ACTIVATING,
        navigation: a
      })
    ).toEqual(
      expect.objectContaining({
        elapsed: 10
      })
    )

    expect(
      m.fold({
        type: EventTypes.NAVIGATION_ACTIVATED,
        navigation: a
      })
    ).toEqual(
      expect.objectContaining({
        elapsed: 20
      })
    )

    expect(
      m.fold({
        type: EventTypes.NAVIGATION_END,
        navigation: a
      })
    ).toEqual(
      expect.objectContaining({
        elapsed: 30
      })
    )
  })
})

const inc10ms = (function() {
  let x = 0
  return () => {
    x = x + 10
    return x
  }
})()
