// @flow
import { autorun, toJS } from 'mobx'
import RouterStore from '../model/RouterStore'
import Scheduler from './Scheduler'
import Route from '../model/Route'
import { EventTypes } from './events'
import { scan } from 'ramda'

const scanChildren = scan((curr, idx) => curr.children[idx])

describe('Scheduler', () => {
  let scheduler, store

  beforeEach(() => {
    store = createStore()
    scheduler = createScheduler(store)
  })

  describe('Activation and deactivation guards', () => {
    test('Activation fails', async () => {
      const spy = jest.fn(() => false)
      const [_, __, todosRoot] = scanChildren(store.state.root, [0, 0])

      updateNode(todosRoot, { canActivate: spy })
      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/todos' } })

      await scheduler.processNextNavigation()

      // Navigation should be blocked.
      expect(store.location.pathname).toBe(undefined)

      // Navigation is cleared.
      expect(toJS(scheduler.nextNavigation)).toBe(null)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0].value.key).toBe(todosRoot.value.key)
      expect(spy.mock.calls[0][1].to.pathname).toEqual('/todos')
    })

    test('Activation successful', async () => {
      const spy = jest.fn(() => true)
      const root = store.state.root
      const [_, appRootNode, todosRoot, todosView] = scanChildren(store.state.root, [
        0,
        0,
        1
      ])
      updateNode(root, { canActivate: spy })
      updateNode(todosRoot, { canActivate: spy })
      updateNode(todosView, { canActivate: spy })
      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/todos/123' } })

      await scheduler.processNextNavigation()

      // Navigation should be processed.
      expect(toJS(store.location)).toEqual({ pathname: '/todos/123' })

      // Navigation is cleared.
      expect(toJS(scheduler.nextNavigation)).toBe(null)

      // Enter lifecycle method should be called.
      expect(spy).toHaveBeenCalledTimes(3)

      // Activation is called in bottom-up order.
      expect(spy.mock.calls[0][0].value.key).toEqual(root.value.key)
      expect(spy.mock.calls[1][0].value.key).toEqual(todosRoot.value.key)
      expect(spy.mock.calls[2][0].value.key).toEqual(todosView.value.key)

      // Matched params are passed to hook.
      expect(spy.mock.calls[2][0].value.params).toEqual({ id: '123' })

      // Nodes are marked as active
      expect(store.nodes.length).toEqual(4)

      // Instance references should be kept
      expect(store.state.root).toBe(root)
      expect(store.state.root.children[0]).toBe(appRootNode)
      expect(store.state.root.children[0].children[0]).toBe(todosRoot)
      expect(store.state.root.children[0].children[0].children[1]).toBe(todosView)
      expect(store.nodes[0]).toBe(root)
      expect(store.nodes[1]).toBe(appRootNode)
      expect(store.nodes[2]).toBe(todosRoot)
      expect(store.nodes[3]).toBe(todosView)

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
      const [root, _, todosRoot, todosView] = scanChildren(store.state.root, [0, 1, 1])
      updateNode(todosRoot, { canDeactivate: rootSpy })
      updateNode(todosView, { canDeactivate: viewSpy })
      store.updateNodes([root, todosRoot, todosView])
      store.location.pathname = '/todos/123'
      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/' } })

      await scheduler.processNextNavigation()

      // Navigation should be processed.
      expect(toJS(store.location.pathname)).toEqual('/todos/123')

      // Navigation is cleared.
      expect(toJS(scheduler.nextNavigation)).toBe(null)

      // Deactivation rejection blocks remaining nodes up the path.
      expect(rootSpy).not.toHaveBeenCalled()
      expect(viewSpy).toHaveBeenCalledTimes(1)
      expect(viewSpy.mock.calls[0][0].value.key).toEqual(todosView.value.key)
    })

    test('Deactivation successful', async () => {
      const spy = jest.fn(() => true)
      const [root, _, todosRoot, todosView] = scanChildren(store.state.root, [0, 1, 1])
      updateNode(todosRoot, { canDeactivate: spy })
      updateNode(todosView, { canDeactivate: spy })
      store.location.pathname = '/todos/123'
      store.updateNodes([root, todosRoot, todosView])
      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/' } })

      await scheduler.processNextNavigation()

      // Navigation should be processed.
      expect(toJS(store.location)).toEqual({ pathname: '/' })

      // Navigation is cleared.
      expect(toJS(scheduler.nextNavigation)).toBe(null)

      // Deactivation hook is called.
      expect(spy).toHaveBeenCalledTimes(2)

      // Deactivation is called in bottom-up order.
      expect(spy.mock.calls[0][0].value.key).toEqual(todosView.value.key)
      expect(spy.mock.calls[1][0].value.key).toEqual(todosRoot.value.key)

      // Nodes are marked as active
      expect(store.nodes.length).toEqual(2)
      expect(store.nodes.map(node => node.value.path)).toEqual(['', ''])
    })

    describe('Async activation and deactivation', () => {
      test('Activation fails', async () => {
        const spy = jest.fn(() => Promise.reject())
        const [_, __, todosRoot] = scanChildren(store.state.root, [0, 0])
        updateNode(todosRoot, { canActivate: spy })
        scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/todos' } })

        await scheduler.processNextNavigation()

        expect(store.location.pathname).toBe(undefined)
      })

      test('Activation success', async () => {
        const spy = jest.fn(() => Promise.resolve())
        const todosRoot = store.state.root.children[0].children[0]
        updateNode(todosRoot, { canActivate: spy })
        scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/todos' } })

        await scheduler.processNextNavigation()

        expect(store.location.pathname).toBe('/todos')
      })

      test('Deactivation fails', async () => {
        const spy = jest.fn(() => Promise.reject())
        const [_, appRootNode, todosRoot] = scanChildren(store.state.root, [0, 0])
        updateNode(todosRoot, { canDeactivate: spy })
        store.location.pathname = '/todos/'
        store.updateNodes([store.state.root, appRootNode, todosRoot])
        scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/' } })

        await scheduler.processNextNavigation()

        expect(store.location.pathname).toBe('/todos/')
      })

      test('Deactivation success', async () => {
        const spy = jest.fn(() => Promise.resolve())
        const [_, appRootNode, todosRoot] = scanChildren(store.state.root, [0, 0])
        updateNode(todosRoot, { canDeactivate: spy })
        store.location.pathname = '/todos'
        store.updateNodes([store.state.root, appRootNode, todosRoot])
        scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/' } })

        await scheduler.processNextNavigation()

        expect(store.location.pathname).toBe('/')
      })
    })

    test('Emits redirection in abort event from guard', async () => {
      const spy = jest.fn((a, b) => {
        return b.redirectTo('/sign-in')
      })
      const [_, __, todosRoot] = scanChildren(store.state.root, [0, 0])

      updateNode(todosRoot, { canActivate: spy })
      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/todos' } })
      const events = []
      const dispose = autorun(() => {
        events.push(scheduler.event)
      })

      await scheduler.processNextNavigation()

      expect(events).toEqual(
        expect.arrayContaining([
          {
            type: 'NAVIGATION_ABORTED',
            location: expect.anything(),
            nextNavigation: {
              type: 'PUSH',
              to: { pathname: '/sign-in' },
              from: expect.anything()
            }
          }
        ])
      )

      dispose()
    })
  })

  describe('Errors', () => {
    test('Handling unmatched segments', async () => {
      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/nope/nope/nope' } })
      await scheduler.processNextNavigation()
      expect(store.location.pathname).toBe(undefined)
      expect(store.error).toBeDefined()
      expect(store.error && store.error.toString()).toMatch(/No match/)
    })
  })

  describe('Dynamic children', () => {
    test('Expansion of nested dynamic children during location', async () => {
      const [_, __, ___, todosView] = scanChildren(store.state.root, [0, 0, 1])
      updateNode(todosView, {
        loadChildren: () =>
          Promise.resolve([
            Route({
              path: 'edit',
              loadChildren: () => Promise.resolve([{ path: 'preview' }])
            })
          ])
      })

      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/todos/123/edit/preview' } })

      await scheduler.processNextNavigation()

      expect(store.location.pathname).toEqual('/todos/123/edit/preview')
    })
  })

  // TODO: This should be extracted to the Router.
  describe('Events', () => {
    test('Navigation start, error, end', async () => {
      const spy = jest.fn()
      autorun(() => spy(scheduler.event))

      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/' } })
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

      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/nope' } })
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
    test('Nodes are called in order or deactivation and activation path', async () => {
      // Setup
      const spy = jest.fn(() => true)
      const [root, appRoot, todosRoot, todosView] = scanChildren(store.state.root, [
        0,
        0,
        1
      ])
      const [_, projectsRootNode, projectsListNode] = scanChildren(appRoot, [1, 0])
      const [__, ___, projectsViewNode] = scanChildren(appRoot, [1, 1])

      updateNode(todosRoot, { onTransition: spy })
      updateNode(todosView, { params: { id: '1' }, onTransition: spy })
      updateNode(projectsRootNode, { onTransition: spy })
      updateNode(projectsViewNode, { onTransition: spy })
      updateNode(projectsListNode, { onTransition: spy })
      updateLocation('/todos/1', [root, todosRoot, todosView])

      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/projects/2' } })
      await scheduler.processNextNavigation()

      expect(store.location.pathname).toEqual('/projects/2')

      // Leave transition hooks are bottom up.
      expect(
        spy.mock.calls.map(args => ({
          type: args[0].type,
          key: args[0].node.value.key,
          path: args[0].node.value.path
        }))
      ).toEqual([
        {
          key: todosView.value.key,
          path: ':id',
          type: 'leaving'
        },
        {
          key: projectsRootNode.value.key,
          path: 'projects',
          type: 'entering'
        },
        {
          key: todosRoot.value.key,
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
      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/projects' } })
      await scheduler.processNextNavigation()

      expect(store.location.pathname).toEqual('/projects')

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
    })

    test('In progress transition will set location, nodes and prevNodes in store', async () => {
      // Setup
      let nodesDuringListTransition = []
      let nodesDuringViewTransition = []
      let prevNodesDuringListTransition = []
      let prevNodesDuringViewTransition = []
      const [root, appRoot, todosRoot, todosView] = scanChildren(store.state.root, [
        0,
        0,
        1
      ])
      const todosList = todosRoot.children[0]
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
      updateNode(todosList, { onTransition: listTransitionSpy })
      updateNode(todosView, { onTransition: viewTransitionSpy })
      updateLocation('/todos', [root, appRoot, todosRoot, todosList])

      scheduler.scheduleNavigation({ type: 'PUSH', to: { pathname: '/todos/1' } })
      await scheduler.processNextNavigation()

      expect(nodesDuringListTransition.length).toBe(4)
      expect(nodesDuringViewTransition.length).toBe(4)
      expect(prevNodesDuringListTransition.length).toBe(4)
      expect(prevNodesDuringViewTransition.length).toBe(4)
      expect(prevNodesDuringViewTransition.map(x => x.value.path)).toEqual([
        '',
        '',
        'todos',
        ''
      ])
      expect(nodesDuringViewTransition.map(x => x.value.path)).toEqual([
        '',
        '',
        'todos',
        ':id'
      ])
      expect(nodesDuringViewTransition[3].value.params.id).toEqual('1')
      expect(store.prevNodes.length).toBe(0) // Previous nodes are cleared after location ends.
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
        },
        {
          path: 'sign-in',
          children: []
        }
      ]
    })
  ])
  return store
}

function createScheduler(store) {
  return new Scheduler(store)
}
