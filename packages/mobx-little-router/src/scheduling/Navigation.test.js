// @flow
import Navigation from './Navigation'

describe('Navigation', () => {
  test('Transformations', () => {
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
