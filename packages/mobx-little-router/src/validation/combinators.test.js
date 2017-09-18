// @flow
import { and, or } from './combinators'
import * as m from './matchers'

describe('Combinators', () => {
  test('and', () => {
    const f = and(m.string, m.func)
    expect(f(null)).toEqual({ pass: false, type: 'string' })
    expect(f('abc')).toEqual({ pass: false, type: 'function' })
    expect(() => and()).toThrow(/Combinator/)
  })

  test('or', () => {
    const f = or(m.string, m.func)
    expect(f(null)).toEqual({ pass: false, type: 'string | function' })
    expect(f('abc')).toEqual({ pass: true, type: 'string' })
    expect(f(() => {})).toEqual({ pass: true, type: 'string | function' })
    expect(() => or()).toThrow(/Combinator/)
  })
})
