// @flow
import createRouteStateTreeNode from './createRouteStateTreeNode'
import RouterStateTree from './RouterStateTree'
import createRouteKey from './createRouteKey'

describe('createRouteKey', () => {
  const node = createRouteStateTreeNode({ path: 'a' })

  test('Create simple key', async () => {
    expect(createRouteKey(node, '')).toEqual(node.value.key)
  })

  test('Create a key with segment', () => {
    const segment = '/123'
    expect(createRouteKey(node, segment)).toEqual(`${node.value.key}${segment}`)
  })
})
