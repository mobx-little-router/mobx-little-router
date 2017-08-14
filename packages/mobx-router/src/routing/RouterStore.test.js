// @flow
import { autorun } from 'mobx'
import RouterStore from './RouterStore'
import createRouteNode from './createRouteNode'

describe('RouterStore', () => {
  let store

  beforeEach(() => {
    store = new RouterStore()
  })

  test('Initial parent', () => {
    expect(store.state.root.value.path).toEqual('')
    expect(store.lookup.get(store.state.root.value.key)).toBe(store.state.root)
  })

  test('Updating children', done => {
    const a = createRouteNode({
      path: 'a',
      children: []
    })

    const b = createRouteNode({
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
    expect(store.lookup.get(a.value.key)).toBe(a)
    expect(store.lookup.get(b.value.key)).toBe(b)

    expect(() => store.replaceChildren(createRouteNode({ path: '' }), [])).toThrow(
      /Cannot add children/
    )
  })

  test('Activating nodes', () => {
    const a = createRouteNode({
      path: 'a',
      children: []
    })

    const b = createRouteNode({
      path: 'b',
      children: []
    })

    store.replaceChildren(store.state.root, [a])
    store.activateNodes([store.state.root, a])

    expect(store.activeNodes.length).toBe(2)
    expect(store.activeNodes[0].value.path).toEqual('')
    expect(store.activeNodes[1].value.path).toEqual('a')
  })

  test('Node update', () => {
    store.updateNode(store.state.root, {
      data: {
        x: 'Hello'
      }
    })

    expect(store.state.root.value.data.x).toEqual('Hello')

    expect(() => {
      store.updateNode(createRouteNode({
        path: 'doesnotexist',
        children: []
      }), {})
    }).toThrow(/Cannot update/)
  })
})
