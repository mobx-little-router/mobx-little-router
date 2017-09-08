// @flow
import { autorun } from 'mobx'
import type { Route, PathElement } from './types'
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

    expect(() =>
      store.replaceChildren(createRouteStateTreeNode({ path: '' }), [])
    ).toThrow(/Node not found/)
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
    store.updateRoutes([createRoute(a, '1', { x: '1' }, {})])

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

    store.updateRoutes([createRoute(a, '2', { x: '2' }, {})])

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

  test('Building routes from path', () => {
    const spy = jest.fn(() => Promise.resolve())
    const dataSpy = jest.fn(() => Promise.resolve())
    const a = createRouteStateTreeNode({ path: 'a', getData: () => dataSpy('a') })
    const b = createRouteStateTreeNode({ path: 'b', getData: () => dataSpy('b') })
    const c = createRouteStateTreeNode({ path: 'c', getData: () => dataSpy('c') })
    const currRoutes: Route<*, *>[] = [
      {
        key: `${a.value.key}/a/1`,
        node: a,
        context: {},
        data: {},
        params: { x: '1' },
        query: {},
        onTransition: spy,
        segment: '/a/1'
      },
      {
        key: `${b.value.key}/b/2`,
        node: b,
        context: {},
        data: {},
        params: { y: '2' },
        query: {},
        onTransition: spy,
        segment: '/b/2'
      }
    ]
    const nextPath: PathElement<*, *>[] = [
      { node: a, params: { x: '3' }, segment: '/a/3', remaining: '/b/2/c/4' },
      { node: b, params: { y: '2' }, segment: '/b/2', remaining: '/c/4' },
      { node: c, params: { z: '4' }, segment: '/c/4', remaining: '' }
    ]
    store.routes.replace(currRoutes)

    const nextRoutes = store.getNextRoutes(nextPath, {})

    expect(dataSpy).toHaveBeenCalledTimes(2)
    expect(dataSpy.mock.calls.map(x => x[0])).toEqual(['a', 'c']) // 'b' is not called since it did not change.

    expect(nextRoutes.length).toEqual(3)
    expect(nextRoutes[0]).not.toBe(store.routes[0])
    expect(nextRoutes[1]).toBe(store.routes[1])
    expect(nextRoutes[2]).toBeDefined() // Newly created route.
  })

  test('Query params', () => {
    const query = store.getQueryParams({ search: '?a=1&b=2' })
    expect(query).toEqual({ a: '1', b: '2' })

    store.location = { pathname: '/', search: '?q=Hello' }
    expect(store.query).toEqual({ q: 'Hello' })
  })

  test('Routes with query params', () => {
    const a = createRouteStateTreeNode({
      path: 'a',
      children: [],
      query: ['q']
    })

    const b = createRouteStateTreeNode({
      path: 'b',
      children: [],
      query: ['r']
    })

    store.replaceChildren(store.state.root, [a, b])
    store.updateRoutes([createRoute(a, '', {}, { q: 'hey' })])

    expect(store.routes[0]).toEqual(
      expect.objectContaining({
        query: { q: 'hey' },
        node: expect.objectContaining({
          value: expect.objectContaining({
            path: 'a'
          })
        })
      })
    )

    store.updateRoutes([createRoute(b, '', {}, { r: 'what' })])

    expect(store.routes[0]).toEqual(
      expect.objectContaining({
        query: { r: 'what' },
        node: expect.objectContaining({
          value: expect.objectContaining({
            path: 'b'
          })
        })
      })
    )
  })
})
