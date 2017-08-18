// @flow
import { toJS } from 'mobx'
import RouterStore from '../routing/RouterStore'
import Scheduler from './Scheduler'
import createRouteNode from '../routing/createRouteNode'

describe('Scheduler', () => {
  let scheduler, store

  beforeEach(() => {
    store = createStore()
    scheduler = createScheduler(store)
  })

  describe('Scheduling and processing navigation', () => {
    test('Activation fails', async () => {
      const spy = jest.fn(() => Promise.reject('Nope'))
      const todosRootNode = store.state.root.children[1]
      store.updateNode(todosRootNode, {
        hooks: { canActivate: [spy] }
      })
      scheduler.scheduleNavigation({ pathname: '/todos' }, 'PUSH')

      await scheduler.processNavigation()

      // Navigation should be blocked.
      expect(store.location.pathname).toBe(undefined)

      // Navigation is cleared.
      expect(toJS(scheduler.navigation)).toBe(null)

      // Enter lifecycle method should not be called.
      expect(spy).toHaveBeenCalledTimes(1)
    })

    test('Activation successful', async () => {
      const spy = jest.fn(() => Promise.resolve())
      const rootNode = store.state.root
      const todosRootNode = store.state.root.children[1]
      const todosViewNode = store.state.root.children[1].children[1]
      store.updateNode(rootNode, { hooks: { canActivate: [spy] } })
      store.updateNode(todosRootNode, { hooks: { canActivate: [spy] } })
      store.updateNode(todosViewNode, { hooks: { canActivate: [spy] } })
      scheduler.scheduleNavigation({ pathname: '/todos/123' }, 'PUSH')

      await scheduler.processNavigation()

      // Navigation should be processed.
      expect(toJS(store.location)).toEqual({ pathname: '/todos/123/' })

      // Navigation is cleared.
      expect(toJS(scheduler.navigation)).toBe(null)

      // Enter lifecycle method should be called.
      expect(spy).toHaveBeenCalledTimes(3)

      // Activation is called in bottom-up order.
      expect(spy.mock.calls[0][0]).toEqual(rootNode)
      expect(spy.mock.calls[1][0]).toEqual(todosRootNode)
      expect(spy.mock.calls[2][0]).toEqual(todosViewNode)

      // Matched params are passed to hook.
      expect(spy.mock.calls[2][1]).toEqual({ id: '123' })

      // Nodes are marked as active
      expect(store.nodes.length).toEqual(3)
      expect(store.nodes.map(node => node.value.path)).toEqual(['', 'todos', ':id'])
      expect(store.nodes.map(node => node.value.params)).toEqual([{}, {}, { id: '123' }])
    })
  })

  test('Deactivation fails', async () => {
    const rootSpy = jest.fn(() => Promise.resolve())
    const viewSpy = jest.fn(() => Promise.reject())
    const rootNode = store.state.root
    const todosRootNode = store.state.root.children[1]
    const todosViewNode = store.state.root.children[1].children[1]
    store.updateNode(todosRootNode, { hooks: { canDeactivate: [rootSpy] } })
    store.updateNode(todosViewNode, { hooks: { canDeactivate: [viewSpy] } })
    store.location.pathname = '/todos/123'
    store.activateNodes([rootNode, todosRootNode, todosViewNode])
    scheduler.scheduleNavigation({ pathname: '/' }, 'PUSH')

    await scheduler.processNavigation()

    // Navigation should be processed.
    expect(toJS(store.location.pathname)).toEqual('/todos/123')

    // Navigation is cleared.
    expect(toJS(scheduler.navigation)).toBe(null)

    // Deactivation rejection blocks remaining nodes up the path.
    expect(rootSpy).not.toHaveBeenCalled()
    expect(viewSpy).toHaveBeenCalledTimes(1)
    expect(viewSpy.mock.calls[0][0]).toEqual(todosViewNode)
  })

  test('Deactivation successful', async () => {
    const spy = jest.fn(() => Promise.resolve())
    const rootNode = store.state.root
    const todosRootNode = store.state.root.children[1]
    const todosViewNode = store.state.root.children[1].children[1]
    store.updateNode(todosRootNode, { hooks: { canDeactivate: [spy] } })
    store.updateNode(todosViewNode, { hooks: { canDeactivate: [spy] } })
    store.location.pathname = '/todos/123'
    store.activateNodes([rootNode, todosRootNode, todosViewNode])
    scheduler.scheduleNavigation({ pathname: '/' }, 'PUSH')

    await scheduler.processNavigation()

    // Navigation should be processed.
    expect(toJS(store.location)).toEqual({ pathname: '/' })

    // Navigation is cleared.
    expect(toJS(scheduler.navigation)).toBe(null)

    // Deactivation hook is called.
    expect(spy).toHaveBeenCalledTimes(2)

    // Deactivation is called in bottom-up order.
    expect(spy.mock.calls[0][0]).toEqual(todosViewNode)
    expect(spy.mock.calls[1][0]).toEqual(todosRootNode)

    // Nodes are marked as active
    expect(store.nodes.length).toEqual(2)
    expect(store.nodes.map(node => node.value.path)).toEqual(['', ''])
  })

  test('Handling unmatched segments', async () => {
    scheduler.scheduleNavigation({ pathname: '/nope/nope/nope' }, 'PUSH')
    await scheduler.processNavigation()
    expect(store.location.pathname).toBe(undefined)
    expect(store.error).toBeDefined()
    expect(store.error && store.error.toString()).toMatch(/No match/)
  })

  test('Expansion of nested dynamic children during navigation', async () => {
    const todosViewNode = store.state.root.children[1].children[1]
    store.updateNode(todosViewNode, {
      loadChildren: () =>
        Promise.resolve([
          createRouteNode({
            path: 'edit',
            loadChildren: () => Promise.resolve([{ path: 'preview' }])
          })
        ])
    })

    scheduler.scheduleNavigation({ pathname: '/todos/123/edit/preview' }, 'PUSH')

    await scheduler.processNavigation()

    expect(store.location.pathname).toEqual('/todos/123/edit/preview/')
  })

  test('Transition hooks are called in order', async () => {
    // Setup
    const leaveSpy = jest.fn(() => Promise.resolve())
    const enterSpy = jest.fn(() => Promise.resolve())
    const rootNode = store.state.root
    const todosRootNode = store.state.root.children[1]
    const todosViewNode = store.state.root.children[1].children[1]
    const projectsRootNode = store.state.root.children[2]
    const projectsListNode = store.state.root.children[2].children[0]
    const projectsViewNode = store.state.root.children[2].children[1]
    store.updateNode(todosRootNode, {
      hooks: { onLeave: [leaveSpy], onEnter: [enterSpy] }
    })
    store.updateNode(todosViewNode, {
      params: { id: '1' },
      hooks: { onLeave: [leaveSpy], onEnter: [enterSpy] }
    })
    store.updateNode(projectsRootNode, {
      hooks: { onEnter: [enterSpy], onLeave: [leaveSpy] }
    })
    store.updateNode(projectsViewNode, {
      hooks: { onEnter: [enterSpy], onLeave: [leaveSpy] }
    })
    store.updateNode(projectsListNode, {
      hooks: { onEnter: [enterSpy], onLeave: [leaveSpy] }
    })
    store.location.pathname = '/todos/1'
    store.activateNodes([rootNode, todosRootNode, todosViewNode])

    scheduler.scheduleNavigation({ pathname: '/projects/2' }, 'PUSH')
    await scheduler.processNavigation()

    expect(store.location.pathname).toEqual('/projects/2/')

    // Leave transition hooks are bottom up.
    expect(
      leaveSpy.mock.calls.map(args => ({
        key: args[0].value.key,
        path: args[0].value.path
      }))
    ).toEqual([
      {
        key: todosViewNode.value.key,
        path: ':id'
      },
      {
        key: todosRootNode.value.key,
        path: 'todos'
      }
    ])

    // Enter transition hooks are top down.
    expect(
      enterSpy.mock.calls.map(args => ({
        key: args[0].value.key,
        path: args[0].value.path
      }))
    ).toEqual([
      {
        key: projectsRootNode.value.key,
        path: 'projects'
      },
      {
        key: projectsViewNode.value.key,
        path: ':id'
      }
    ])

    leaveSpy.mockClear()
    enterSpy.mockClear()
    scheduler.scheduleNavigation({ pathname: '/projects' }, 'PUSH')
    await scheduler.processNavigation()

    expect(store.location.pathname).toEqual('/projects/')

    // Only the project view node is leaving.
    expect(
      leaveSpy.mock.calls.map(args => ({
        key: args[0].value.key,
        path: args[0].value.path
      }))
    ).toEqual([
      {
        key: projectsViewNode.value.key,
        path: ':id'
      }
    ])

    // Only the project list node is entering.
    expect(
      enterSpy.mock.calls.map(args => ({
        key: args[0].value.key,
        path: args[0].value.path
      }))
    ).toEqual([
      {
        key: projectsListNode.value.key,
        path: ''
      }
    ])
  })

  test('In progress transition will set nextNodes in store', async () => {
    // Setup
    let nextNodesDuringLeave = []
    let nextNodesDuringEnter = []
    const rootNode = store.state.root
    const todosRootNode = store.state.root.children[1]
    const todosListNode = store.state.root.children[1].children[0]
    const todosViewNode = store.state.root.children[1].children[1]
    // Prepare spies and futures to assert in the middle of activation.
    const listLeaveSpy = jest.fn(
      () =>
        new Promise(res => {
          nextNodesDuringLeave = store.nextNodes.slice()
          res()
        })
    )
    const viewEnterSpy = jest.fn(
      () =>
        new Promise(res => {
          nextNodesDuringEnter = store.nextNodes.slice()
          res()
        })
    )
    store.updateNode(todosListNode, { hooks: { onLeave: [listLeaveSpy] } })
    store.updateNode(todosViewNode, { hooks: { onEnter: [viewEnterSpy] } })
    store.location.pathname = '/todos'
    store.activateNodes([rootNode, todosRootNode, todosListNode])

    scheduler.scheduleNavigation({ pathname: '/todos/1' }, 'PUSH')
    await scheduler.processNavigation()

    expect(nextNodesDuringLeave.length).toBe(3)
    expect(nextNodesDuringEnter.length).toBe(3)
    expect(nextNodesDuringEnter[2].value.params.id).toEqual('1')
  })
})

function createStore() {
  const store = new RouterStore()
  store.replaceChildren(store.state.root, [
    createRouteNode({ path: '', children: [] }),
    createRouteNode({
      path: 'todos',
      children: [{ path: '', children: [] }, { path: ':id', children: [] }]
    }),
    createRouteNode({
      path: 'projects',
      children: [{ path: '', children: [] }, { path: ':id', children: [] }]
    })
  ])
  return store
}

function createScheduler(store) {
  return new Scheduler(store)
}
