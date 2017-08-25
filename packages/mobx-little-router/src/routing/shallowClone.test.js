// @flow
import Route from './Route'
import shallowClone from './shallowClone'

describe('shallowClone', () => {
  test('shallowly copies value properties and children', () => {
    const a = Route({
      path: 'a',
      children: [{ path: 'b' }]
    })
    const b = shallowClone(a)

    // Values are copied.
    expect(a.value.key).toEqual(b.value.key)
    expect(a.value.path).toEqual(b.value.path)

    b.value.params = { x: '1' }

    // Original params value is not modified.
    expect(a.value.params.x).toEqual(undefined)
    expect(b.value.params.x).toEqual('1')
  })
})
