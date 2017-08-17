// @flow
import shallowEqual from './shallowEqual'

describe('shallowEqual', () => {
  test('returns true only when objects are equal', () => {
    expect(shallowEqual({ a: 1 }, { a: 1 })).toBe(true)
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false)
  })
})
