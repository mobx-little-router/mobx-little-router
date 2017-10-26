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
    expect(createRoute(node, '/1', '/1', { id: '1' }, { q: 'hey' })).toEqual(
      expect.objectContaining({
        segment: '/1',
        params: { id: '1' },
        query: { q: 'hey' },
        data: expect.objectContaining({ message: 'Hello' }),
        context: { user: 'Alice' }
      })
    )
  })

  test('stringify', () => {
    const route = createRoute(
      createRouteStateTreeNode(
        {
          path: ':id',
          children: []
        },
        () => ({})
      ),
      '/1',
      '/1',
      { id: '1' },
      {}
    )

    expect(route.stringify({ id: '2' })).toEqual('/2')
  })
})
