// @flow
import { runInAction, autorun } from 'mobx'
import type { PathElement } from './types'
import RouterStore from './RouterStore'
import createRouteStateTreeNode from './creating/createRouteStateTreeNode'
import createRouteInstance from './creating/createRouteInstance'

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

  test.only('Updating current nodes', () => {
    const a = { path: 'a/:x', key: 'a', children: [], params: { x: '1' } }
    const b = { path: 'b', key: 'b', children: [], query: ['r'] }
    store.updateChildren(store.state.root, [a, b])

    const routeA = createRouteInstance(store.getNodeUnsafe('a'), '1', '1', { x: '1' }, {})

    store.updateActivatedRoutes({
      exiting: [],
      entering: [routeA],
      deactivating: [],
      activating: [routeA],
      incomingRoutes: [routeA]
    })

    expect(store.activatedRoutes[0]).toEqual(
      expect.objectContaining({
        params: { x: '1' },
        node: expect.objectContaining({
          value: expect.objectContaining({
            path: 'a/:x'
          })
        })
      })
    )

    const routeA_2 = createRouteInstance(store.getNodeUnsafe('a'), '2', '2', { x: '2' }, {})
    store.updateActivatedRoutes({
      exiting: [routeA],
      entering: [routeA_2],
      deactivating: [],
      activating: [],
      incomingRoutes: [routeA_2]
    })

    expect(store.activatedRoutes[0]).toEqual(
      expect.objectContaining({
        params: { x: '2' },
        node: expect.objectContaining({
          value: expect.objectContaining({
            path: 'a/:x'
          })
        })
      })
    )

    expect(store.select('a.params.x').get()).toBe('2')

    const routeB = createRouteInstance(store.getNodeUnsafe('b'), '', '', {}, { r: 'hey' })
    store.updateActivatedRoutes({
      exiting: [routeA_2],
      entering: [routeB],
      deactivating: [routeA_2],
      activating: [routeB],
      incomingRoutes: [routeB]
    })

    expect(store.select('b.query.r').get()).toEqual('hey')
  })

  test('Routes with query params', () => {
    const a = {
      path: 'a',
      key: 'a',
      children: [],
      query: ['q']
    }

    const b = {
      path: 'b',
      key: 'b',
      children: [],
      query: ['r']
    }

    store.updateChildren(store.state.root, [a, b])
    store.updateActivatedRoutes({
      exiting: [],
      entering: [],
      activating: [],
      deactivating: [],
      incomingRoutes: [createRouteInstance(store.getNodeUnsafe('a'), '', '', {}, { q: 'hey' })]
    })

    expect(store.activatedRoutes[0]).toEqual(
      expect.objectContaining({
        query: { q: 'hey' },
        node: expect.objectContaining({
          value: expect.objectContaining({
            path: 'a'
          })
        })
      })
    )

    store.updateActivatedRoutes({
      exiting: [],
      entering: [],
      activating: [],
      deactivating: [],
      incomingRoutes: [createRouteInstance(store.getNodeUnsafe('b'), '', '', {}, { r: 'what' })]
    })

    expect(store.activatedRoutes[0]).toEqual(
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

  test('Subscribing to route changes', () => {
    const a = {
      path: 'a/:id',
      key: 'a',
      model: {
        user: null,
        get name() {
          return this.user ? this.user.name : 'Anonymous'
        }
      },
      subscriptions: route => {
        const { params, model } = route
        return autorun(() => {
          const user = { id: params.id, name: `User ${params.id}` }
          runInAction(() => {
            model.user = user
          })
        })
      },
      children: []
    }

    store.updateChildren(store.state.root, [a])
    store.updateActivatedRoutes({
      exiting: [],
      entering: [],
      activating: [],
      deactivating: [],
      incomingRoutes: [createRouteInstance(store.getNodeUnsafe('a'), '', '/a/1', { id: '1' }, {})]
    })

    const route = store.activatedRoutes[0]
    const results = []

    autorun(() => results.push(route.model.name))

    expect(route.model.user).toEqual({ id: '1', name: 'User 1' })

    store.updateActivatedRoutes({
      exiting: [],
      entering: [],
      activating: [],
      deactivating: [],
      incomingRoutes: [createRouteInstance(store.getNodeUnsafe('a'), '', '/a/2', { id: '2' }, {})]
    })
    expect(route.model.user).toEqual({ id: '2', name: 'User 2' })

    expect(results).toEqual(['User 1', 'User 2'])
  })
})
