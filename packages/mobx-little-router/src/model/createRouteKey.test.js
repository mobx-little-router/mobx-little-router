// @flow
import createRouteStateTreeNode from './createRouteStateTreeNode'
import RouterStateTree from './RouterStateTree'
import createRouteKey from './createRouteKey'

describe('createRouteKey', () => {
  const node = createRouteStateTreeNode({ path: 'a' })

  test('Create simple key', async () => {
    expect(createRouteKey(node, '', {})).toEqual(node.value.key)
  })

  test('Create a key with segment', () => {
    const segment = '/123'
    expect(createRouteKey(node, segment, {})).toEqual(`${node.value.key}${segment}`)
  })

  test('Create a key with query params', () => {
    const query = { a: 1, b: 2 }
    expect(createRouteKey(node, '', query)).toEqual(`${node.value.key}?a=1&b=2`)
  })

  test('Create a key with segment and query', () => {
    const segment = '/news'
    const query = { q: 'hello' }
    expect(createRouteKey(node, segment, query)).toEqual(`${node.value.key}${segment}?q=hello`)
  })
})
