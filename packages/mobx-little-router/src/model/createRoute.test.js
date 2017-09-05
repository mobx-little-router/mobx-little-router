// @flow
import createRouteStateTreeNode from './createRouteStateTreeNode'
import createRoute from './createRoute'

describe('createRouteStateTreeNode', () => {
  let node

  beforeEach(() => {
    node = createRouteStateTreeNode(
      {
        path: '',
        children: [],
        getData: () => ({ message: 'Hello' })
      },
      () => ({
        user: 'Alice'
      })
    )
  })

  test('Sets the params, context and data', () => {
    expect(createRoute(node, { id: '1' }, '/1')).toEqual(
      expect.objectContaining({
        params: { id: '1' },
        data: { message: 'Hello' },
        context: { user: 'Alice' }
      })
    )
  })
})
