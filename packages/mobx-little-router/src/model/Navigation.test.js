// @flow
import Navigation from './Navigation'

describe('Navigation', () => {
  test('Morphisms', () => {
    const a = new Navigation({
      type: 'PUSH',
      to: { pathname: '/' }
    })

    expect(a.sequence).toEqual(0) // Default sequence number.

    expect(a.next({ type: 'PUSH', to: { pathname: '/login' } })).toEqual({
      type: 'PUSH',
      sequence: 1,
      from: { pathname: '/' },
      to: { pathname: '/login' },
      shouldTransition: true,
      cancelled: false
    })

    expect(a.prev()).toEqual({
      type: 'GO_BACK',
      sequence: 1,
      from: { pathname: '/' },
      to: null,
      shouldTransition: true,
      cancelled: false
    })

    // Sequence increments after each call.
    expect(
      a
        .next({ type: 'PUSH', to: { pathname: '/a' } })
        .next({ type: 'PUSH', to: { pathname: '/b' } })
        .next({ type: 'PUSH', to: { pathname: '/c' } })
        .prev()
    ).toEqual(
      expect.objectContaining({
        sequence: 4
      })
    )
  })

  test('Effects', () => {
    const a = new Navigation({
      type: 'PUSH',
      to: { pathname: '/' }
    })

    expect(a.redirectTo('/login')).rejects.toEqual({
      type: 'PUSH',
      from: { pathname: '/' },
      to: { pathname: '/login' },
      sequence: 1,
      shouldTransition: true,
      cancelled: false
    })

    expect(a.goBack()).rejects.toEqual({
      type: 'GO_BACK',
      from: { pathname: '/' },
      to: null,
      sequence: 1,
      shouldTransition: true,
      cancelled: false
    })
  })
})
