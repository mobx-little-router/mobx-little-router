// @flow
import { autorun, toJS } from 'mobx'
import RouterStore from '../routing/RouterStore'
import Scheduler from './Scheduler'
import Route from '../routing/Route'
import { EventTypes } from '../events'

describe('Scheduler', () => {
  let scheduler, store

  beforeEach(() => {
    store = createStore()
    scheduler = createScheduler(store)
  })

  describe('Activation and deactivation guards', () => {
    test('Activation fails', async () => {
      const spy = jest.fn(() => false)
      const todosRootNode = store.state.root.children[0].children[0]
      updateNode(todosRootNode, { canActivate: spy })
      scheduler.scheduleNavigation({ pathname: '/todos' }, 'PUSH')

      await scheduler.processNextNavigation()

      // Navigation should be blocked.
      expect(store.location.pathname).toBe(undefined)

      // Navigation is cleared.
      expect(toJS(scheduler.navigation)).toBe(null)

      // Enter lifecycle method should not be called.
      expect(spy).toHaveBeenCalledTimes(1)
    })

    test('Activation successful', async () => {
      const spy = jest.fn(() => true)
      const rootNode = store.state.root
      const appRootNode = store.state.root.children[0]
      const todosRootNode = appRootNode.children[0]
      const todosViewNode = appRootNode.children[0].children[1]
      updateNode(rootNode, { canActivate: spy })
      updateNode(todosRootNode, { canActivate: spy })
      updateNode(todosViewNode, { canActivate: spy })
      scheduler.scheduleNavigation({ pathname: '/todos/123' }, 'PUSH')

      await scheduler.processNextNavigation()

      // Navigation should be processed.
      expect(toJS(store.location)).toEqual({ pathname: '/todos/123/' })

      // Navigation is cleared.
      expect(toJS(scheduler.navigation)).toBe(null)

      // Enter lifecycle method should be called.
      expect(spy).toHaveBeenCalledTimes(3)

      // Activation is called in bottom-up order.
      expect(spy.mock.calls[0][0].value.key).toEqual(rootNode.value.key)
      expect(spy.mock.calls[1][0].value.key).toEqual(todosRootNode.value.key)
      expect(spy.mock.calls[2][0].value.key).toEqual(todosViewNode.value.key)

      // Matched params are passed to hook.
      expect(spy.mock.calls[2][0].value.params).toEqual({ id: '123' })

      // Nodes are marked as active
      expect(store.nodes.length).toEqual(4)

      // Instance references should be kept
      expect(store.state.root).toBe(rootNode)
      expect(store.state.root.children[0]).toBe(appRootNode)
      expect(store.state.root.children[0].children[0]).toBe(todosRootNode)
      expect(store.state.root.children[0].children[0].children[1]).toBe(todosViewNode)
      expect(store.nodes[0]).toBe(rootNode)
      expect(store.nodes[1]).toBe(appRootNode)
      expect(store.nodes[2]).toBe(todosRootNode)
      expect(store.nodes[3]).toBe(todosViewNode)

      expect(store.nodes.map(node => node.value.path)).toEqual(['', '', 'todos', ':id'])
      expect(store.nodes.map(node => node.value.params)).toEqual([
        {},
        {},
        {},
        { id: '123' }
      ])
    })

    test('Deactivation fails', async () => {
      const rootSpy = jest.fn(() => true)
      const viewSpy = jest.fn(() => false)
      const rootNode = store.state.root
      const todosRootNode = rootNode.children[0].children[1]
      const todosViewNode = rootNode.children[0].children[1].children[1]
      updateNode(todosRootNode, { canDeactivate: rootSpy })
      updateNode(todosViewNode, { canDeactivate: viewSpy })
      store.updateNodes([rootNode, todosRootNode, todosViewNode])
      store.location.pathname = '/todos/123'
      scheduler.scheduleNavigation({ pathname: '/' }, 'PUSH')

      await scheduler.processNextNavigation()

      // Navigation should be processed.
      expect(toJS(store.location.pathname)).toEqual('/todos/123')

      // Navigation is cleared.
      expect(toJS(scheduler.navigation)).toBe(null)

      // Deactivation rejection blocks remaining nodes up the path.
      expect(rootSpy).not.toHaveBeenCalled()
      expect(viewSpy).toHaveBeenCalledTimes(1)
      expect(viewSpy.mock.calls[0][0].value.key).toEqual(todosViewNode.value.key)
    })

    test('Deactivation successful', async () => {
      const spy = jest.fn(() => true)
      const rootNode = store.state.root
      const todosRootNode = store.state.root.children[0].children[1]
      const todosViewNode = store.state.root.children[0].children[1].children[1]
      updateNode(todosRootNode, { canDeactivate: spy })
      updateNode(todosViewNode, { canDeactivate: spy })
      store.location.pathname = '/todos/123'
      store.updateNodes([rootNode, todosRootNode, todosViewNode])
      scheduler.scheduleNavigation({ pathname: '/' }, 'PUSH')

      await scheduler.processNextNavigation()

      // Navigation should be processed.
      expect(toJS(store.location)).toEqual({ pathname: '/' })

      // Navigation is cleared.
      expect(toJS(scheduler.navigation)).toBe(null)

      // Deactivation hook is called.
      expect(spy).toHaveBeenCalledTimes(2)

      // Deactivation is called in bottom-up order.
      expect(spy.mock.calls[0][0].value.key).toEqual(todosViewNode.value.key)
      expect(spy.mock.calls[1][0].value.key).toEqual(todosRootNode.value.key)

      // Nodes are marked as active
      expect(store.nodes.length).toEqual(2)
      expect(store.nodes.map(node => node.value.path)).toEqual(['', ''])
    })

    describe('Async activation and deactivation', () => {
      test('Activation fails', async () => {
        const spy = jest.fn(() => Promise.reject())
        const todosRootNode = store.state.root.children[0].children[0]
        updateNode(todosRootNode, { canActivate: spy })
        scheduler.scheduleNavigation({ pathname: '/todos' }, 'PUSH')

        await scheduler.processNextNavigation()

        expect(store.location.pathname).toBe(undefined)
      })

      test('Activation success', async () => {
        const spy = jest.fn(() => Promise.resolve())
        const todosRootNode = store.state.root.children[0].children[0]
        updateNode(todosRootNode, { canActivate: spy })
        scheduler.scheduleNavigation({ pathname: '/todos' }, 'PUSH')

        await scheduler.processNextNavigation()

        expect(store.location.pathname).toBe('/todos/')
      })

      test('Deactivation fails', async () => {
        const spy = jest.fn(() => Promise.reject())
        const appRootNode = store.state.root.children[0]
        const todosRootNode = appRootNode.children[0]
        updateNode(todosRootNode, { canDeactivate: spy })
        store.location.pathname = '/todos/'
        store.updateNodes([store.state.root, appRootNode, todosRootNode])
        scheduler.scheduleNavigation({ pathname: '/' }, 'PUSH')

        await scheduler.processNextNavigation()

        expect(store.location.pathname).toBe('/todos/')
      })

      test('Deactivation success', async () => {
        const spy = jest.fn(() => Promise.resolve())
        const appRootNode = store.state.root.children[0]
        const todosRootNode = appRootNode.children[0]
        updateNode(todosRootNode, { canDeactivate: spy })
        store.location.pathname = '/todos'
        store.updateNodes([store.state.root, appRootNode, todosRootNode])
        scheduler.scheduleNavigation({ pathname: '/' }, 'PUSH')

        await scheduler.processNextNavigation()

        expect(store.location.pathname).toBe('/')
      })
    })
  })

  describe('Errors', () => {
    test('Handling unmatched segments', async () => {
      scheduler.scheduleNavigation({ pathname: '/nope/nope/nope' }, 'PUSH')
      await scheduler.processNextNavigation()
      expect(store.location.pathname).toBe(undefined)
      expect(store.error).toBeDefined()
      expect(store.error && store.error.toString()).toMatch(/No match/)
    })
  })

  describe('Dynamic children', () => {
    test('Expansion of nested dynamic children during navigation', async () => {
      const todosViewNode = store.state.root.children[0].children[0].children[1]
      updateNode(todosViewNode, {
        loadChildren: () =>
          Promise.resolve([
            Route({
              path: 'edit',
              loadChildren: () => Promise.resolve([{ path: 'preview' }])
            })
          ])
      })

      scheduler.scheduleNavigation({ pathname: '/todos/123/edit/preview' }, 'PUSH')

      await scheduler.processNextNavigation()

      expect(store.location.pathname).toEqual('/todos/123/edit/preview/')
    })
  })

  // TODO: This should be extracted to the Router.
  describe('Events', () => {
    test('Navigation start, error, end', async () => {
      const spy = jest.fn()
      autorun(() => spy(scheduler.event))

      scheduler.scheduleNavigation({ pathname: '/' }, 'PUSH')
      await scheduler.processNextNavigation()

      expect(spy).toHaveBeenCalled()

      let eventTypes = spy.mock.calls.map(x => x[0] && x[0].type)
      expect(eventTypes).toEqual(
        expect.arrayContaining([EventTypes.NAVIGATION_START, EventTypes.NAVIGATION_END])
      )
      expect(eventTypes).not.toEqual(
        expect.arrayContaining([EventTypes.NAVIGATION_ERROR])
      )

      spy.mockClear()

      scheduler.scheduleNavigation({ pathname: '/nope' }, 'PUSH')
      await scheduler.processNextNavigation()

      expect(spy).toHaveBeenCalled()

      eventTypes = spy.mock.calls.map(x => x[0] && x[0].type)
      expect(eventTypes).toEqual(
        expect.arrayContaining([
          EventTypes.NAVIGATION_START,
          EventTypes.NAVIGATION_ERROR,
          EventTypes.NAVIGATION_END
        ])
      )
    })
  })

  describe('Transitions', () => {
    test(
      'Nodes are called in order or deactivation and activation path',
      async () => {
        // Setup
        const spy = jest.fn(() => true)
        const rootNode = store.state.root
        const todosRootNode = store.state.root.children[0].children[0]
        const todosViewNode = store.state.root.children[0].children[0].children[1]
        const projectsRootNode = store.state.root.children[0].children[1]
        const projectsListNode = store.state.root.children[0].children[1].children[0]
        const projectsViewNode = store.state.root.children[0].children[1].children[1]
        updateNode(todosRootNode, { onTransition: spy })
        updateNode(todosViewNode, { params: { id: '1' }, onTransition: spy })
        updateNode(projectsRootNode, { onTransition: spy })
        updateNode(projectsViewNode, { onTransition: spy })
        updateNode(projectsListNode, { onTransition: spy })
        updateLocation('/todos/1', [rootNode, todosRootNode, todosViewNode])

        scheduler.scheduleNavigation({ pathname: '/projects/2' }, 'PUSH')
        await scheduler.processNextNavigation()

        expect(store.location.pathname).toEqual('/projects/2/')

        // Leave transition hooks are bottom up.
        expect(
          spy.mock.calls.map(args => ({
            type: args[0].type,
            key: args[0].node.value.key,
            path: args[0].node.value.path
          }))
        ).toEqual([
          {
            key: todosViewNode.value.key,
            path: ':id',
            type: 'leaving'
          },
          {
            key: projectsRootNode.value.key,
            path: 'projects',
            type: 'entering'
          },
          {
            key: todosRootNode.value.key,
            path: 'todos',
            type: 'leaving'
          },
          {
            key: projectsViewNode.value.key,
            path: ':id',
            type: 'entering'
          }
        ])

        spy.mockClear()
        scheduler.scheduleNavigation({ pathname: '/projects' }, 'PUSH')
        await scheduler.processNextNavigation()

        expect(store.location.pathname).toEqual('/projects/')

        // Only the project view node is leaving.
        expect(
          spy.mock.calls.map(args => ({
            type: args[0].type,
            key: args[0].node.value.key,
            path: args[0].node.value.path
          }))
        ).toEqual([
          {
            key: projectsViewNode.value.key,
            path: ':id',
            type: 'leaving'
          },
          {
            key: projectsListNode.value.key,
            path: '',
            type: 'entering'
          }
        ])
      }
    )

    test('In progress transition will set location, nodes and prevNodes in store', async () => {
      // Setup
      let nodesDuringListTransition = []
      let nodesDuringViewTransition = []
      let prevNodesDuringListTransition = []
      let prevNodesDuringViewTransition = []
      const rootNode = store.state.root
      const appRootNode = store.state.root.children[0]
      const todosRootNode = store.state.root.children[0].children[0]
      const todosListNode = store.state.root.children[0].children[0].children[0]
      const todosViewNode = store.state.root.children[0].children[0].children[1]
      // Prepare spies and futures to assert in the middle of activation.
      const listTransitionSpy = jest.fn(
        () =>
          new Promise(res => {
            prevNodesDuringListTransition = store.prevNodes.slice()
            nodesDuringListTransition = store.nodes.slice()
            res()
          })
      )
      const viewTransitionSpy = jest.fn(
        () =>
          new Promise(res => {
            prevNodesDuringViewTransition = store.prevNodes.slice()
            nodesDuringViewTransition = store.nodes.slice()
            res()
          })
      )
      updateNode(todosListNode, { onTransition: listTransitionSpy })
      updateNode(todosViewNode, { onTransition: viewTransitionSpy })
      updateLocation('/todos', [rootNode, appRootNode, todosRootNode, todosListNode])

      scheduler.scheduleNavigation({ pathname: '/todos/1' }, 'PUSH')
      await scheduler.processNextNavigation()

      expect(nodesDuringListTransition.length).toBe(4)
      expect(nodesDuringViewTransition.length).toBe(4)
      expect(prevNodesDuringListTransition.length).toBe(4)
      expect(prevNodesDuringViewTransition.length).toBe(4)
      expect(prevNodesDuringViewTransition.map(x => x.value.path)).toEqual(['', '', 'todos', ''])
      expect(nodesDuringViewTransition.map(x => x.value.path)).toEqual(['', '', 'todos', ':id'])
      expect(nodesDuringViewTransition[3].value.params.id).toEqual('1')
      expect(store.prevNodes.length).toBe(0) // Previous nodes are cleared after navigation ends.
    })
  })

  function updateNode(node: *, props: Object) {
    store.updateNode(node, props)
  }

  function updateLocation(location: *, nodes: *) {
    store.location.pathname = location
    store.updateNodes(nodes)
  }
})

function createStore() {
  const store = new RouterStore()
  store.replaceChildren(store.state.root, [
    Route({
      path: '',
      children: [
        {
          path: 'todos',
          children: [
            { path: '', match: 'full', children: [] },
            { path: ':id', children: [] }
          ]
        },
        {
          path: 'projects',
          children: [
            { path: '', match: 'full', children: [] },
            { path: ':id', children: [] }
          ]
        }
      ]
    })
  ])
  return store
}

function createScheduler(store) {
  return new Scheduler(store)
}
