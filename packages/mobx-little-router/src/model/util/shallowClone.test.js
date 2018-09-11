// @flow
import createRouteStateTreeNode from '../creating/createRouteStateTreeNode'
import shallowClone from './shallowClone'

describe('shallowClone', () => {
  test('shallowly copies value properties and children', () => {
    const a = createRouteStateTreeNode({
      path: 'a',
      children: [
        {
          path: 'b'
        }
      ]
    })
    const b = shallowClone(a)

    // Values are copied.
    expect(a.value.key).toEqual(b.value.key)
    expect(a.value.path).toEqual(b.value.path)

    b.value.getData = () => ({ x: '1' })

    expect(b.value.getData().x).toEqual('1')
  })
})
