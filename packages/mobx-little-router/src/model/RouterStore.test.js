// @flow
import { runInAction, autorun } from 'mobx'
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

  test('Updating current nodes', () => {
    const a = createRouteStateTreeNode({
      path: 'a',
      children: [],
      params: {
        x: '1'
      }
    })

    replaceChildren(store.state.root, [a])
    store.updateRoutes([createRoute(a, '1', '1', { x: '1' }, {})])

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

    store.updateRoutes([createRoute(a, '2', '2', { x: '2' }, {})])

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

  test('Building routes from path', () => {
    const spy = jest.fn(() => Promise.resolve())
    const dataSpy = jest.fn(() => Promise.resolve())
    const a = createRouteStateTreeNode({ path: 'a', getData: () => dataSpy('a') })
    const b = createRouteStateTreeNode({ path: 'b', getData: () => dataSpy('b') })
    const c = createRouteStateTreeNode({ path: 'c', getData: () => dataSpy('c') })
    const currRoutes: any[] = [
      {
        key: `${a.value.key}/a/1`,
        value: `${a.value.key}/a/1?`,
        node: a,
        context: {},
        data: {},
        params: { x: '1' },
        query: {},
        onTransition: spy,
        segment: '/a/1',
        parentUrl: ''
      },
      {
        key: `${b.value.key}/b/2`,
        value: `${b.value.key}/b/2?`,
        node: b,
        context: {},
        data: {},
        params: { y: '2' },
        query: {},
        onTransition: spy,
        segment: '/b/2',
        parentUrl: ''
      }
    ]
    const nextPath: PathElement<*, *>[] = [
      { node: a, params: { x: '3' }, parentUrl: '', segment: '/a/3', remaining: '/b/2/c/4' },
      { node: b, params: { y: '2' }, parentUrl: '', segment: '/b/2', remaining: '/c/4' },
      { node: c, params: { z: '4' }, parentUrl: '', segment: '/c/4', remaining: '' }
    ]
    store.routes.replace(currRoutes)

    const nextRoutes = store.getNextRoutes(nextPath, ({}: any))

    expect(nextRoutes.length).toEqual(3)
    expect(nextRoutes[0]).not.toBe(store.routes[0])
    expect(nextRoutes[1]).toBe(store.routes[1])
    expect(nextRoutes[2]).toBeDefined() // Newly created route.
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

    replaceChildren(store.state.root, [a, b])
    store.updateRoutes([createRoute(a, '', '', {}, { q: 'hey' })])

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

    store.updateRoutes([createRoute(b, '', '', {}, { r: 'what' })])

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

function replaceChildren(parent: any, nodes: any) {
  nodes.forEach(x => {
    runInAction(() => {
      x.value.getContext = parent.value.getContext
    })
  })
  runInAction(() => {
    parent.children.replace(nodes)
    nodes.forEach(child => {
      replaceChildren(child, child.children.slice())
    })
  })
}

function updateNode(node: any, updates: any) {
  runInAction(() => {
    Object.assign(node.value, updates)
  })
}
