// @flow
import { autorun } from 'mobx'
import RouterStore from './RouterStore'
import createRouteStateTreeNode from './createRouteStateTreeNode'
import createRoute from './createRoute'

describe('RouterStore', () => {
  let store, root, getContext

  beforeEach(() => {
    getContext = jest.fn(() => ({
      message: 'Hello'
    }))
    root = createRouteStateTreeNode({ path: '' }, getContext)
    store = new RouterStore(root)
  })

  test('Initial parent', () => {
    expect(store.state.root.value.path).toEqual('')
    expect(store.cache.get(store.state.root.value.key)).toBe(store.state.root)
  })

  test('Updating children', done => {
    const a = createRouteStateTreeNode({
      path: 'a',
      children: []
    })

    const b = createRouteStateTreeNode({
      path: 'b',
      children: []
    })

    // Make sure we can get a reaction to children changes.
    autorun(() => {
      if (store.state.root.children.length > 0) {
        done()
      }
    })

    store.replaceChildren(store.state.root, [a, b])

    expect(store.state.root.children.length).toBe(2)

    // Stores new nodes in lookup table.
    expect(store.cache.get(a.value.key)).toEqual(
      expect.objectContaining({
        value: expect.objectContaining({
          key: a.value.key
        })
      })
    )
    expect(store.cache.get(b.value.key)).toEqual(
      expect.objectContaining({
        value: expect.objectContaining({
          key: b.value.key
        })
      })
    )

    // Context is chained.
    expect(store.cache.get(a.value.key).value.getContext()).toEqual({
      message: 'Hello'
    })
    expect(store.cache.get(b.value.key).value.getContext()).toEqual({
      message: 'Hello'
    })

    expect(() => store.replaceChildren(createRouteStateTreeNode({ path: '' }), [])).toThrow(
      /Node not found/
    )
  })

  test('Updating current nodes', () => {
    const a = createRouteStateTreeNode({
      path: 'a',
      children: [],
      params: {
        x: '1'
      }
    })

    store.replaceChildren(store.state.root, [a])
    store.updateRoutes([createRoute(a, { x: '1' }, '1')])

    expect(store.routes[0]).toEqual(
      expect.objectContaining({
        params: { x: '1' },
        node: expect.objectContaining({
          value: expect.objectContaining({
            path: 'a'
          })
        })
      })
    )
    store.updateRoutes([
      createRoute(a, {
        x: '2'
      }, '2')
    ])

    expect(store.routes[0]).toEqual(
      expect.objectContaining({
        params: { x: '2' },
        node: expect.objectContaining({
          value: expect.objectContaining({
            path: 'a'
          })
        })
      })
    )

    expect(store.prevRoutes[0]).toEqual(
      expect.objectContaining({
        params: { x: '1' },
        node: expect.objectContaining({
          value: expect.objectContaining({
            path: 'a'
          })
        })
      })
    )
  })

  test('Node update', () => {
    store.updateNode(store.state.root, {
      getData: () => ({ x: 'Hello' })
    })

    expect(store.state.root.value.getData().x).toEqual('Hello')

    expect(() => {
      store.updateNode(
        createRouteStateTreeNode({
          path: 'doesnotexist',
          children: []
        }),
        {}
      )
    }).toThrow(/Node not found/)
  })
})
