// @flow
import Transition from './Transition'

describe('Transition', () => {
  test('Transformations', () => {
    const a = Transition({
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
