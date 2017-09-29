// @flow
import compose from './compose'
import Middleware from './Middleware'

describe('Middleware compose', () => {
  test('applies right to left', () => {
    const a = Middleware(evt => {
      return { ...evt, x: evt.x.concat(['a']) }
    })
    const b = Middleware(evt => {
      return { ...evt, x: evt.x.concat(['b']) }
    })
    const c = Middleware(evt => {
      return { ...evt, x: evt.x.concat(['c']) }
    })
    const d = compose(c, b, a)

    expect(d.fold({ type: 'EMPTY', x: [] })).toEqual({
      type: 'EMPTY',
      x: ['a', 'b', 'c']
    })
  })
})
