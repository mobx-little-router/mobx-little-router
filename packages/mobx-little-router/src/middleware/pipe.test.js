// @flow
import pipe from './pipe'
import Middleware from './Middleware'

describe('Middleware pipe', () => {
  test('applies left to right', () => {
    const a = Middleware(evt => {
      return { ...evt, x: evt.x.concat(['a']) }
    })
    const b = Middleware(evt => {
      return { ...evt, x: evt.x.concat(['b']) }
    })
    const c = Middleware(evt => {
      return { ...evt, x: evt.x.concat(['c']) }
    })
    const d = pipe(a, b, c)

    expect(d.fold({ type: 'EMPTY', x: [] })).toEqual({
      type: 'EMPTY',
      x: ['a', 'b', 'c']
    })
  })
})
