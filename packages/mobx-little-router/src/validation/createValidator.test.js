// @flow
import createValidator from './createValidator'
import * as m from './matchers'
import { or } from './combinators'
import { optional } from './util'

describe('createValidator', () => {
  let validate

  beforeEach(() => {
    validate = createValidator({
      w: optional(m.array),
      x: m.string,
      y: m.func,
      z: optional(or(m.string, m.number))
    })
  })

  test('void return when pass', () => {
    expect(validate({
      x: 'hello',
      y: () => {}
    })).not.toBeDefined()

    expect(validate({
      x: 'hello',
      y: () => {},
      z: 123
    })).not.toBeDefined()

    expect(validate({
      w: [],
      x: 'hello',
      y: () => {},
      z: 'abc'
    })).not.toBeDefined()
  })

  test('throws when failed', () => {
    expect(() => validate({
      x: 'hello'
    })).toThrow(/Expected `y` to be of type `function`/)

    expect(() => validate({
      x: 'hello',
      y: () => {},
      z: () => {}
    })).toThrow(/Expected `z` to be of type `empty | string | number`/)

    expect(() => validate({
      w: 1,
      x: 'hello',
      y: () => {},
      z: () => {}
    })).toThrow(/Expected `w` to be of type `empty | array`/)
  })
})
