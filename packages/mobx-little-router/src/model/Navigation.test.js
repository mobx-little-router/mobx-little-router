// @flow
import Navigation from './Navigation'

describe('Navigation', () => {
  test('Morphisms', () => {
    const a = new Navigation({
      type: 'PUSH',
      to: { pathname: '/' }
    })

    expect(a.sequence).toEqual(0) // Default sequence number.

    expect(a.next('/login')).toEqual({
      type: 'PUSH',
      sequence: 1,
      from: { pathname: '/' },
      to: { pathname: '/login' }
    })

    expect(a.prev()).toEqual({
      type: 'GO_BACK',
      sequence: 1,
      from: { pathname: '/' },
      to: null
    })

    // Sequence increments after each call.
    expect(a.next('/a').next('/b').next('/c').prev()).toEqual(expect.objectContaining({
      sequence: 4
    }))
  })

  test('Effects', () => {
    const a = new Navigation({
      type: 'PUSH',
      to: { pathname: '/' }
    })

    expect(a.redirectTo('/login')).rejects.toEqual({
      type: 'PUSH',
      from: { pathname: '/' },
      to: { pathname: '/login' }
    })

    expect(a.goBack()).rejects.toEqual({
      type: 'GO_BACK',
      from: { pathname: '/' },
      to: null
    })
  })
})
