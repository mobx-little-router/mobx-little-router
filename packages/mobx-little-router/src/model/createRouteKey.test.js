// @flow
import createRouteStateTreeNode from './createRouteStateTreeNode'
import RouterStateTree from './RouterStateTree'
import createRouteKey, { createHash } from './createRouteKey'

describe('createRouteKey', () => {
  const node = createRouteStateTreeNode({ path: 'a' })

  test('Create simple key', async () => {
    expect(createRouteKey(node, '')).toEqual('1/9b61ad43')
  })

  test('Create a key with segment', () => {
    const segment = '/123'
    expect(createRouteKey(node, segment)).toEqual('1/2bd5199e')
  })
})
