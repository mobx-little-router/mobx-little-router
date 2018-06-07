// @flow
import createRouteStateTreeNode from './createRouteStateTreeNode'
import RouterStateTree from './RouterStateTree'
import createRouteKey, { createHash } from './createRouteKey'

describe('createHash', () => {
  test('Create a hash', async () => {
    expect(createHash('')).toEqual('811c9dc5')
    expect(createHash('/abc/123')).toEqual('a7a42171')
  })
})

describe('createRouteKey', () => {
  const node = createRouteStateTreeNode({ path: 'a' })

  test('Create simple key', async () => {
    expect(createRouteKey(node, '')).toEqual('1/811c9dc5')
  })

  test('Create a key with segment', () => {
    expect(createRouteKey(node, '/abc/123')).toEqual('1/a7a42171')
    expect(createRouteKey(node, '/abc/456')).toEqual('1/e4ea4b1e')
  })
})
