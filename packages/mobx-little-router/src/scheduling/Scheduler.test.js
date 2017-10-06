// @flow
import { runInAction, autorun, toJS } from 'mobx'
import { scan } from 'ramda'
import Middleware from '../middleware/Middleware'
import RouterStore from '../model/RouterStore'
import delay from '../util/delay'
import Scheduler from './Scheduler'
import createRouteStateTreeNode from '../model/createRouteStateTreeNode'
import createRoute from '../model/createRoute'
import { EventTypes } from '../events'

const scanChildren = scan((curr, idx) => curr.children[idx])

describe('Scheduler', () => {
  let scheduler, store

  beforeEach(() => {
    store = createStore()
    scheduler = createScheduler(store)
    scheduler.start()
  })

  afterEach(() => {
    scheduler.stop()
  })

  describe('multiple navigation', () => {
    test('cancels previous navigation', async () => {
      const events = []
      autorun(() => {
        events.push(scheduler.event)
      })

      scheduler.schedule({ type: 'PUSH', to: { pathname: '/todos' } })
      scheduler.schedule({ type: 'PUSH', to: { pathname: '/todos/123' } })
      scheduler.schedule({ type: 'PUSH', to: { pathname: '/' } })
      scheduler.schedule({ type: 'PUSH', to: { pathname: '/todos' } })

      await nextTick()

      expectEventTimes(EventTypes.NAVIGATION_START, 4, events)
      expectEventTimes(EventTypes.NAVIGATION_CANCELLED, 4, events)
      expectEventTimes(EventTypes.NAVIGATION_END, 1, events)
    })
  })

  describe('activation and deactivation guards', () => {
    test('Activation fails', async () => {
      const spy = jest.fn(() => false)
      const [_, __, todosRoot] = scanChildren(store.state.root, [0, 0])

      updateNode(todosRoot, { canActivate: spy })
      scheduler.schedule({ type: 'PUSH', to: { pathname: '/todos' } })

      await nextTick()

      // Navigation should be blocked.
      expect(store.location.pathname).toBe(undefined)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0].key).toMatch(new RegExp(todosRoot.value.key))
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
      scheduler.schedule({ type: 'PUSH', to: { pathname: '/todos/123' } })

      await nextTick()

      // Navigation should be processed.
      expect(toJS(store.location)).toEqual({ pathname: '/todos/123' })

      // Enter lifecycle method should be called.
      expect(spy).toHaveBeenCalledTimes(3)

      // Activation is called in bottom-up order.
      expect(spy.mock.calls[0][0].key).toMatch(new RegExp(root.value.key))
      expect(spy.mock.calls[1][0].key).toMatch(new RegExp(todosRoot.value.key))
      expect(spy.mock.calls[2][0].key).toMatch(new RegExp(todosView.value.key))

      // Matched params are passed to hook.
      expect(spy.mock.calls[2][0].params).toEqual({ id: '123' })

      // Nodes are marked as active
      expect(store.routes.length).toEqual(4)

      expect(store.routes.map(route => route.node.value.path)).toEqual([
        '',
        '',
        'todos',
        ':id'
      ])
      expect(store.routes.map(route => route.params)).toEqual([{}, {}, {}, { id: '123' }])
    })

    test('Deactivation fails', async () => {
      const rootSpy = jest.fn(() => true)
      const viewSpy = jest.fn(() => false)
      const [root, _, todosRoot, todosView] = scanChildren(store.state.root, [0, 1, 1])
      updateNode(todosRoot, { canDeactivate: rootSpy })
      updateNode(todosView, { canDeactivate: viewSpy })
      store.updateRoutes(
        [root, todosRoot, todosView].map(x => createRoute(x, '', {}, {}))
      )
      store.location.pathname = '/todos/123'
      scheduler.schedule({ type: 'PUSH', to: { pathname: '/' } })

      await nextTick()

      // Navigation should be processed.
      expect(toJS(store.location.pathname)).toEqual('/todos/123')

      // Deactivation rejection blocks remaining nodes up the path.
      expect(rootSpy).not.toHaveBeenCalled()
      expect(viewSpy).toHaveBeenCalledTimes(1)
      expect(viewSpy.mock.calls[0][0].key).toEqual(todosView.value.key)
    })

    test('Deactivation successful', async () => {
      const spy = jest.fn(() => true)
      const [root, _, todosRoot, todosView] = scanChildren(store.state.root, [0, 1, 1])
      updateNode(todosRoot, { canDeactivate: spy })
      updateNode(todosView, { canDeactivate: spy })
      store.location.pathname = '/todos/123'
      store.updateRoutes(
        [root, todosRoot, todosView].map(x => createRoute(x, '', {}, {}))
      )
      scheduler.schedule({ type: 'PUSH', to: { pathname: '/' } })

      await nextTick()

      // Navigation should be processed.
      expect(toJS(store.location)).toEqual({ pathname: '/' })

      // Deactivation hook is called.
      expect(spy).toHaveBeenCalledTimes(2)

      // Deactivation is called in bottom-up order.
      expect(spy.mock.calls[0][0].key).toEqual(todosView.value.key)
      expect(spy.mock.calls[1][0].key).toEqual(todosRoot.value.key)

      // Nodes are marked as active
      expect(store.routes.length).toEqual(2)
      expect(store.routes.map(route => route.node.value.path)).toEqual(['', ''])
    })

    describe('Async activation and deactivation', () => {
      test('Activation fails', async () => {
        const spy = jest.fn(() => Promise.reject())
        const [_, __, todosRoot] = scanChildren(store.state.root, [0, 0])
        updateNode(todosRoot, { canActivate: spy })
        scheduler.schedule({ type: 'PUSH', to: { pathname: '/todos' } })

        await nextTick()

        expect(store.location.pathname).toBe(undefined)
      })

      test('Activation success', async () => {
        const spy = jest.fn(() => Promise.resolve())
        const todosRoot = store.state.root.children[0].children[0]
        updateNode(todosRoot, { canActivate: spy })

        scheduler.start()
        scheduler.schedule({ type: 'PUSH', to: { pathname: '/todos' } })

        await nextTick()

        expect(store.location.pathname).toBe('/todos')

        scheduler.stop()
      })

      test('Deactivation throws', async () => {
        const spy = jest.fn(() => {
          throw new Error('Oops')
        })
        const [_, appRootNode, todosRoot] = scanChildren(store.state.root, [0, 0])
        updateNode(todosRoot, { canDeactivate: spy })
        store.location.pathname = '/todos/'
        store.updateRoutes(
          [store.state.root, appRootNode, todosRoot].map(x => createRoute(x, '', {}, {}))
        )
        scheduler.schedule({ type: 'PUSH', to: { pathname: '/' } })

        await nextTick()

        expect(store.location.pathname).toBe('/todos/')
      })

      test('Deactivation rejects', async () => {
        const spy = jest.fn(() => Promise.reject())
        const [_, appRootNode, todosRoot] = scanChildren(store.state.root, [0, 0])
        updateNode(todosRoot, { canDeactivate: spy })
        store.location.pathname = '/todos/'
        store.updateRoutes(
          [store.state.root, appRootNode, todosRoot].map(x => createRoute(x, '', {}, {}))
        )
        scheduler.schedule({ type: 'PUSH', to: { pathname: '/' } })

        await nextTick()

        expect(store.location.pathname).toBe('/todos/')
      })

      test('Deactivation success', async () => {
        const spy = jest.fn(() => Promise.resolve())
        const [_, appRootNode, todosRoot] = scanChildren(store.state.root, [0, 0])
        updateNode(todosRoot, { canDeactivate: spy })
        store.location.pathname = '/todos'
        store.updateRoutes(
          [store.state.root, appRootNode, todosRoot].map(x => createRoute(x, '', {}, {}))
        )
        scheduler.schedule({ type: 'PUSH', to: { pathname: '/' } })

        await nextTick()

        expect(store.location.pathname).toBe('/')
      })
    })

    test('Emits navigation in abort event from guard', async () => {
      const spy = jest.fn((a, b) => {
        return b.redirectTo('/sign-in')
      })
      const [_, __, todosRoot] = scanChildren(store.state.root, [0, 0])

      updateNode(todosRoot, { canActivate: spy })
      const events = []
      const dispose = autorun(() => {
        events.push(scheduler.event)
      })

      scheduler.schedule({
        type: 'PUSH',
        sequence: 0,
        to: { pathname: '/todos' }
      })

      await nextTick()

      expect(events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'NAVIGATION_CANCELLED',
            nextNavigation: expect.objectContaining({
              type: 'REPLACE',
              from: expect.anything(),
              to: { pathname: '/sign-in' }
            })
          })
        ])
      )

      dispose()
    })

    test('Context is passed to guard functions', async () => {
      const canActivate = jest.fn(() => true)
      const canDeactivate = jest.fn(() => true)
      const [_, __, todosRoot] = scanChildren(store.state.root, [0, 0])
      updateNode(todosRoot, { canActivate, canDeactivate })
      await nextTick()

      scheduler.schedule({ type: 'PUSH', to: { pathname: '/todos' } })
      await nextTick()

      expect(canActivate).toHaveBeenCalled()

      expect(canActivate.mock.calls[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            context: { message: 'Hello' }
          })
        ])
      )

      scheduler.schedule({ type: 'PUSH', to: { pathname: '/' } })
      await nextTick()

      expect(canDeactivate).toHaveBeenCalled()
      expect(canDeactivate.mock.calls[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            context: { message: 'Hello' }
          })
        ])
      )
    })
  })

  describe('before hooks during activation/deactivation', () => {
    let spy
    let events
    let dispose
    let todosRoot

    beforeEach(() => {
      events = []
      dispose = autorun(() => events.push(scheduler.event))
      spy = jest.fn((a, b) => {
        return b.redirectTo('/sign-in')
      })
      todosRoot = scanChildren(store.state.root, [0, 0])[2]
      updateNode(todosRoot, { willDeactivate: spy, willActivate: spy })
    })

    afterEach(() => dispose())

    test('Can cancel navigation from willActivate', async () => {
      scheduler.schedule({
        type: 'PUSH',
        sequence: 0,
        to: { pathname: '/todos' }
      })

      await nextTick()

      expect(events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'NAVIGATION_CANCELLED',
            nextNavigation: expect.objectContaining({
              type: 'REPLACE',
              from: expect.anything(),
              to: { pathname: '/sign-in' }
            })
          })
        ])
      )
    })

    test('Can cancel navigation from willDeactivate', async () => {
      store.location.pathname = '/todos/'
      store.updateRoutes(
        [store.state.root, todosRoot].map(x => createRoute(x, '', {}, {}))
      )

      scheduler.schedule({ type: 'PUSH', sequence: 0, to: { pathname: '/' } })

      await nextTick()

      expect(events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'NAVIGATION_CANCELLED',
            nextNavigation: expect.objectContaining({
              type: 'REPLACE',
              from: expect.anything(),
              to: { pathname: '/sign-in' }
            })
          })
        ])
      )
    })
  })

  describe('transitions', () => {
    beforeEach(() => {
      // Set sequence number to 0 or greater, otherwise transitions won't run.
      runInAction(() => {
        scheduler.currentNavigation.sequence = 0
      })
    })

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

      scheduler.schedule({
        shouldTransition: true,
        type: 'PUSH',
        to: { pathname: '/projects/2' }
      })

      await nextTick()

      expect(store.location.pathname).toEqual('/projects/2')

      // Leave transition hooks are bottom up.
      expect(
        spy.mock.calls.map(args => ({
          type: args[0].type,
          key: args[0].target.node.value.key,
          path: args[0].target.node.value.path
        }))
      ).toEqual([
        {
          key: todosView.value.key,
          path: ':id',
          type: 'exiting'
        },
        {
          key: projectsRootNode.value.key,
          path: 'projects',
          type: 'entering'
        },
        {
          key: todosRoot.value.key,
          path: 'todos',
          type: 'exiting'
        },
        {
          key: projectsViewNode.value.key,
          path: ':id',
          type: 'entering'
        }
      ])

      spy.mockClear()
      scheduler.schedule({ type: 'PUSH', to: { pathname: '/projects' } })
      await nextTick()

      expect(store.location.pathname).toEqual('/projects')

      // Only the project view node is exiting.
      expect(
        spy.mock.calls.map(args => ({
          type: args[0].type,
          key: args[0].target.node.value.key,
          path: args[0].target.node.value.path
        }))
      ).toEqual([
        {
          key: projectsViewNode.value.key,
          path: ':id',
          type: 'exiting'
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
            prevNodesDuringListTransition = store.prevRoutes.slice()
            nodesDuringListTransition = store.routes.slice()
            res()
          })
      )
      const viewTransitionSpy = jest.fn(
        () =>
          new Promise(res => {
            prevNodesDuringViewTransition = store.prevRoutes.slice()
            nodesDuringViewTransition = store.routes.slice()
            res()
          })
      )
      updateNode(todosList, { onTransition: listTransitionSpy })
      updateNode(todosView, { onTransition: viewTransitionSpy })
      updateLocation('/todos', [root, appRoot, todosRoot, todosList])

      scheduler.schedule({
        shouldTransition: true,
        type: 'PUSH',
        to: { pathname: '/todos/1' }
      })

      await nextTick()

      expect(nodesDuringListTransition.length).toBe(4)
      expect(nodesDuringViewTransition.length).toBe(4)
      expect(prevNodesDuringListTransition.length).toBe(4)
      expect(prevNodesDuringViewTransition.length).toBe(4)
      expect(prevNodesDuringViewTransition.map(x => x.node.value.path)).toEqual([
        '',
        '',
        'todos',
        ''
      ])
      expect(nodesDuringViewTransition.map(x => x.node.value.path)).toEqual([
        '',
        '',
        'todos',
        ':id'
      ])
      expect(nodesDuringViewTransition[3].params.id).toEqual('1')
    })
  })

  function updateNode(node: *, props: Object) {
    store.updateNode(node, props)
  }

  function updateLocation(location: *, nodes: *) {
    store.location.pathname = location
    store.updateRoutes(nodes.map(x => createRoute(x, '', {}, {})))
  }
})

function createStore() {
  const store = new RouterStore(
    createRouteStateTreeNode({ path: '', match: 'partial' }, () => ({ message: 'Hello' }))
  )
  store.replaceChildren(store.state.root, [
    createRouteStateTreeNode({
      path: '',
      children: [
        {
          path: 'todos',
          children: [{ path: '' }, { path: ':id', match: 'partial' }]
        },
        {
          path: 'projects',
          children: [{ path: '', match: 'full' }, { path: ':id', match: 'partial' }]
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
  return new Scheduler(store, Middleware.EMPTY)
}

function expectEventTimes(type, times, events) {
  expect(events.filter(e => e.type === type).length).toEqual(times)
}

function nextTick() {
  return delay(0)
}
